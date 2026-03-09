import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ShoppingGateway } from './shopping.gateway';
import { SHOPPING_EVENTS } from '@fogon/types';

@Injectable()
export class ShoppingService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(ShoppingService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly shoppingGateway: ShoppingGateway,
    private readonly notificationsService: NotificationsService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  async findAll(householdId: string) {
    const { data, error } = await this.supabase
      .from('shopping_items')
      .select('*, members:household_members(display_name, user_id)')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const members = row.members as Array<{ display_name: string; user_id: string }> | null;
      return {
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        category: row.category,
        isDone: row.is_done,
        doneByName: row.done_by
          ? members?.find((m) => m.user_id === row.done_by)?.display_name ?? null
          : null,
        addedByName:
          members?.find((m) => m.user_id === row.added_by)?.display_name ?? 'Unknown',
        createdAt: row.created_at,
      };
    });
  }

  async create(householdId: string, userId: string, name: string, quantity: string | null, category: string) {
    const { error } = await this.supabase.from('shopping_items').insert({
      household_id: householdId,
      name,
      quantity,
      category,
      added_by: userId,
    });

    if (error) throw new Error(error.message);

    this.shoppingGateway.emitToHousehold(householdId, SHOPPING_EVENTS.CREATED, {
      householdId,
    });

    this.sendNotification(householdId, userId, `ha añadido "${name}" a la lista de la compra`);
  }

  async toggle(
    householdId: string,
    itemId: string,
    userId: string,
    isDone: boolean,
  ): Promise<{ pantryUpdated: boolean }> {
    const { data, error } = await this.supabase
      .from('shopping_items')
      .update({
        is_done: isDone,
        done_by: isDone ? userId : null,
        done_at: isDone ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .eq('household_id', householdId)
      .select('id, name')
      .single();

    if (error || !data) throw new NotFoundException('Shopping item not found');

    this.shoppingGateway.emitToHousehold(householdId, SHOPPING_EVENTS.TOGGLED, {
      householdId,
      itemId,
    });

    // When marking as done, sync with pantry
    if (!isDone) {
      return { pantryUpdated: false };
    }

    const pantryUpdated = await this.syncToPantry(
      householdId,
      (data as { id: string; name: string }).name,
      userId,
    );

    return { pantryUpdated };
  }

  async clearDone(householdId: string) {
    const { error } = await this.supabase
      .from('shopping_items')
      .delete()
      .eq('household_id', householdId)
      .eq('is_done', true);

    if (error) throw new Error(error.message);

    this.shoppingGateway.emitToHousehold(householdId, SHOPPING_EVENTS.CLEARED, {
      householdId,
    });
  }

  async remove(householdId: string, itemId: string) {
    const { data, error } = await this.supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId)
      .eq('household_id', householdId)
      .select('id')
      .single();

    if (error || !data) throw new NotFoundException('Shopping item not found');

    this.shoppingGateway.emitToHousehold(householdId, SHOPPING_EVENTS.DELETED, {
      householdId,
      itemId,
    });
  }

  async update(householdId: string, itemId: string, name: string, quantity: string | null) {
    const { data, error } = await this.supabase
      .from('shopping_items')
      .update({ name, quantity })
      .eq('id', itemId)
      .eq('household_id', householdId)
      .select('id')
      .single();

    if (error || !data) throw new NotFoundException('Shopping item not found');

    this.shoppingGateway.emitToHousehold(householdId, SHOPPING_EVENTS.UPDATED, {
      householdId,
      itemId,
    });
  }

  private async syncToPantry(householdId: string, itemName: string, userId: string): Promise<boolean> {
    try {
      // Check if item exists in pantry
      const { data: pantryItem } = await this.supabase
        .from('pantry_items')
        .select('id, stock_level')
        .eq('household_id', householdId)
        .ilike('name', itemName)
        .limit(1);

      if (pantryItem && pantryItem.length > 0) {
        // Update existing pantry item to full
        const { error: updateError } = await this.supabase
          .from('pantry_items')
          .update({
            stock_level: 'ok',
            updated_at: new Date().toISOString(),
          })
          .eq('id', pantryItem[0].id)
          .eq('household_id', householdId);

        if (updateError) {
          this.logger.warn(`Failed to update pantry item "${itemName}": ${updateError.message}`);
          return false;
        }

        this.logger.log(`Updated pantry item "${itemName}" to ok for household ${householdId}`);
        return true;
      }

      // Create new pantry item
      const { error: insertError } = await this.supabase.from('pantry_items').insert({
        household_id: householdId,
        name: itemName,
        category: 'otros',
        stock_level: 'ok',
        added_by: userId,
      });

      if (insertError) {
        this.logger.warn(`Failed to create pantry item "${itemName}": ${insertError.message}`);
        return false;
      }

      this.logger.log(`Created pantry item "${itemName}" for household ${householdId}`);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to sync "${itemName}" to pantry`, error);
      return false;
    }
  }

  private sendNotification(householdId: string, userId: string, action: string): void {
    this.getDisplayName(householdId, userId)
      .then((displayName) => {
        this.notificationsService.sendToHousehold({
          householdId,
          title: 'Fogon',
          body: `${displayName} ${action}`,
          excludeUserId: userId,
        });
      })
      .catch((error) => {
        this.logger.warn('Failed to send shopping notification', error);
      });
  }

  private async getDisplayName(householdId: string, userId: string): Promise<string> {
    const { data } = await this.supabase
      .from('household_members')
      .select('display_name')
      .eq('household_id', householdId)
      .eq('user_id', userId)
      .single();

    return (data?.display_name as string) ?? 'Alguien';
  }
}

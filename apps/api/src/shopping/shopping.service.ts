import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ShoppingService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
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
  }

  async toggle(householdId: string, itemId: string, userId: string, isDone: boolean) {
    const { error } = await this.supabase
      .from('shopping_items')
      .update({
        is_done: isDone,
        done_by: isDone ? userId : null,
        done_at: isDone ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .eq('household_id', householdId);

    if (error) throw new Error(error.message);
  }

  async clearDone(householdId: string) {
    const { error } = await this.supabase
      .from('shopping_items')
      .delete()
      .eq('household_id', householdId)
      .eq('is_done', true);

    if (error) throw new Error(error.message);
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
  }
}

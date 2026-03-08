import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import type { StockLevel } from '@fogon/types';

export interface UpdateStockResult {
  addedToShoppingList: boolean;
}

@Injectable()
export class PantryService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(PantryService.name);

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async findAll(householdId: string) {
    const { data, error } = await this.supabase
      .from('pantry_items')
      .select('*')
      .eq('household_id', householdId)
      .order('name');

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      category: row.category,
      stockLevel: row.stock_level,
      updatedAt: row.updated_at,
    }));
  }

  async create(
    householdId: string,
    userId: string,
    name: string,
    quantity: string | null,
    category: string,
    stockLevel: string,
  ) {
    const { error } = await this.supabase.from('pantry_items').insert({
      household_id: householdId,
      name,
      quantity,
      category,
      stock_level: stockLevel,
      added_by: userId,
    });

    if (error) throw new Error(error.message);
  }

  async updateStockLevel(
    householdId: string,
    itemId: string,
    stockLevel: StockLevel,
  ): Promise<UpdateStockResult> {
    const { error } = await this.supabase
      .from('pantry_items')
      .update({
        stock_level: stockLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('household_id', householdId);

    if (error) throw new Error(error.message);

    if (stockLevel !== 'empty') {
      return { addedToShoppingList: false };
    }

    return this.addToShoppingListIfMissing(householdId, itemId);
  }

  private async addToShoppingListIfMissing(
    householdId: string,
    pantryItemId: string,
  ): Promise<UpdateStockResult> {
    const { data: pantryItem, error: fetchError } = await this.supabase
      .from('pantry_items')
      .select('name, category, added_by')
      .eq('id', pantryItemId)
      .eq('household_id', householdId)
      .single();

    if (fetchError || !pantryItem) {
      this.logger.warn(`Could not fetch pantry item ${pantryItemId} for auto-add to shopping list`);
      return { addedToShoppingList: false };
    }

    const { data: existing } = await this.supabase
      .from('shopping_items')
      .select('id')
      .eq('household_id', householdId)
      .ilike('name', pantryItem.name)
      .eq('is_done', false)
      .limit(1);

    if (existing && existing.length > 0) {
      return { addedToShoppingList: false };
    }

    const { error: insertError } = await this.supabase.from('shopping_items').insert({
      household_id: householdId,
      name: pantryItem.name,
      category: pantryItem.category,
      added_by: pantryItem.added_by,
    });

    if (insertError) {
      this.logger.error(`Failed to auto-add "${pantryItem.name}" to shopping list: ${insertError.message}`);
      return { addedToShoppingList: false };
    }

    this.logger.log(`Auto-added "${pantryItem.name}" to shopping list for household ${householdId}`);
    return { addedToShoppingList: true };
  }

  async remove(householdId: string, itemId: string) {
    const { error } = await this.supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId)
      .eq('household_id', householdId);

    if (error) throw new Error(error.message);
  }
}

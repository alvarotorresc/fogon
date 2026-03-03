import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PantryService {
  private readonly supabase: SupabaseClient;

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

  async updateStockLevel(itemId: string, stockLevel: string) {
    const { error } = await this.supabase
      .from('pantry_items')
      .update({
        stock_level: stockLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  async remove(itemId: string) {
    const { error } = await this.supabase.from('pantry_items').delete().eq('id', itemId);
    if (error) throw new Error(error.message);
  }
}

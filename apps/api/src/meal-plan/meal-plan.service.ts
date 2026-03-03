import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MealPlanService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async findByWeek(householdId: string, weekStart: string) {
    const { data, error } = await this.supabase
      .from('meal_plan_entries')
      .select('*, recipe:recipes(id, title, image_url)')
      .eq('household_id', householdId)
      .eq('week_start', weekStart)
      .order('day_of_week')
      .order('slot');

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const recipe = row.recipe as { id: string; title: string; image_url: string | null } | null;
      return {
        id: row.id,
        dayOfWeek: row.day_of_week,
        slot: row.slot,
        recipe: recipe
          ? { id: recipe.id, title: recipe.title, imageUrl: recipe.image_url }
          : null,
        customText: row.custom_text,
      };
    });
  }

  async assign(
    householdId: string,
    userId: string,
    input: {
      weekStart: string;
      dayOfWeek: number;
      slot: string;
      recipeId?: string;
      customText?: string;
    },
  ) {
    const { error } = await this.supabase.from('meal_plan_entries').upsert(
      {
        household_id: householdId,
        week_start: input.weekStart,
        day_of_week: input.dayOfWeek,
        slot: input.slot,
        recipe_id: input.recipeId ?? null,
        custom_text: input.customText ?? null,
        created_by: userId,
      },
      { onConflict: 'household_id,week_start,day_of_week,slot' },
    );

    if (error) throw new Error(error.message);
  }

  async remove(entryId: string) {
    const { error } = await this.supabase
      .from('meal_plan_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw new Error(error.message);
  }
}

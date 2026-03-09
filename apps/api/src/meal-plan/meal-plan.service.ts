import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface GenerateShoppingListResult {
  addedCount: number;
  skippedCount: number;
}

@Injectable()
export class MealPlanService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(MealPlanService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
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

    this.sendNotification(householdId, userId, 'ha actualizado el menu semanal');
  }

  async remove(householdId: string, entryId: string) {
    const { error } = await this.supabase
      .from('meal_plan_entries')
      .delete()
      .eq('id', entryId)
      .eq('household_id', householdId);

    if (error) throw new Error(error.message);
  }

  async generateShoppingList(
    householdId: string,
    userId: string,
    weekStart: string,
  ): Promise<GenerateShoppingListResult> {
    // 1. Get all meal plan entries for the week that reference a recipe
    const { data: entries, error: entriesError } = await this.supabase
      .from('meal_plan_entries')
      .select('recipe_id')
      .eq('household_id', householdId)
      .eq('week_start', weekStart)
      .not('recipe_id', 'is', null);

    if (entriesError) throw new Error(entriesError.message);

    const recipeIds = [
      ...new Set(
        (entries ?? [])
          .map((e: { recipe_id: string | null }) => e.recipe_id)
          .filter((id): id is string => id !== null),
      ),
    ];

    if (recipeIds.length === 0) {
      return { addedCount: 0, skippedCount: 0 };
    }

    // 2. Get all ingredients from those recipes
    const { data: ingredients, error: ingError } = await this.supabase
      .from('recipe_ingredients')
      .select('name, quantity, unit')
      .in('recipe_id', recipeIds);

    if (ingError) throw new Error(ingError.message);

    if (!ingredients || ingredients.length === 0) {
      return { addedCount: 0, skippedCount: 0 };
    }

    // 3. Get existing non-done shopping items to avoid duplicates
    const { data: existingItems, error: existingError } = await this.supabase
      .from('shopping_items')
      .select('name')
      .eq('household_id', householdId)
      .eq('is_done', false);

    if (existingError) throw new Error(existingError.message);

    const existingNames = new Set(
      (existingItems ?? []).map((item: { name: string }) => item.name.toLowerCase()),
    );

    // 4. Deduplicate ingredients by name (case-insensitive), summing quantities
    const ingredientMap = new Map<string, { name: string; quantity: string | null }>();

    for (const ing of ingredients) {
      const key = (ing.name as string).toLowerCase();
      const quantityStr = ing.quantity
        ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}`
        : (ing.unit as string | null) ?? null;

      if (ingredientMap.has(key)) {
        // Keep the first name casing, skip quantity merging (can't reliably sum "2 cups" + "100g")
        continue;
      }
      ingredientMap.set(key, { name: ing.name as string, quantity: quantityStr });
    }

    // 5. Split into new vs existing
    const toAdd: Array<{ name: string; quantity: string | null }> = [];
    let skippedCount = 0;

    for (const [key, value] of ingredientMap) {
      if (existingNames.has(key)) {
        skippedCount++;
      } else {
        toAdd.push(value);
      }
    }

    if (toAdd.length === 0) {
      return { addedCount: 0, skippedCount };
    }

    // 6. Insert new items
    const { error: insertError } = await this.supabase.from('shopping_items').insert(
      toAdd.map((item) => ({
        household_id: householdId,
        name: item.name,
        quantity: item.quantity,
        category: 'otros',
        added_by: userId,
      })),
    );

    if (insertError) throw new Error(insertError.message);

    this.logger.log(
      `Generated shopping list from meal plan: ${toAdd.length} added, ${skippedCount} skipped (household ${householdId}, week ${weekStart})`,
    );

    this.sendNotification(householdId, userId, 'ha generado la lista de la compra desde el menú semanal');

    return { addedCount: toAdd.length, skippedCount };
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
        this.logger.warn('Failed to send meal plan notification', error);
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

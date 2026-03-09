import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

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

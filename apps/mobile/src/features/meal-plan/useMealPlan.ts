import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import type { MealPlanEntry, MealSlot } from '@fogon/types';

interface RawRecipeRef {
  id: string;
  title: string;
  image_url: string | null;
}

interface RawMealPlanRow {
  id: string;
  day_of_week: number;
  slot: string;
  recipe: RawRecipeRef | null;
  custom_text: string | null;
}

function getWeekStart(offset = 0): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useMealPlan(weekOffset = 0) {
  const { household } = useHouseholdStore();
  const weekStart = getWeekStart(weekOffset);

  return useQuery({
    queryKey: ['meal_plan', household?.id, weekStart],
    queryFn: async (): Promise<MealPlanEntry[]> => {
      if (!household) return [];

      const { data, error } = await supabase
        .from('meal_plan_entries')
        .select('*, recipe:recipes(id, title, image_url)')
        .eq('household_id', household.id)
        .eq('week_start', weekStart)
        .order('day_of_week')
        .order('slot');

      if (error) throw error;

      return (data ?? []).map((row) => {
        const r = row as unknown as RawMealPlanRow;
        return {
          id: r.id,
          dayOfWeek: r.day_of_week,
          slot: r.slot as MealSlot,
          recipe: r.recipe
            ? { id: r.recipe.id, title: r.recipe.title, imageUrl: r.recipe.image_url }
            : null,
          customText: r.custom_text,
        };
      });
    },
    enabled: !!household,
  });
}

export function useAssignMeal() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({
      dayOfWeek,
      slot,
      recipeId,
      customText,
      weekOffset = 0,
    }: {
      dayOfWeek: number;
      slot: MealSlot;
      recipeId?: string;
      customText?: string;
      weekOffset?: number;
    }) => {
      const weekStart = getWeekStart(weekOffset);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('meal_plan_entries').upsert(
        {
          household_id: household!.id,
          week_start: weekStart,
          day_of_week: dayOfWeek,
          slot,
          recipe_id: recipeId ?? null,
          custom_text: customText ?? null,
          created_by: user!.id,
        },
        { onConflict: 'household_id,week_start,day_of_week,slot' },
      );

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan'] }),
  });
}

export function useClearMealSlot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meal_plan_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan'] }),
  });
}

export { getWeekStart };

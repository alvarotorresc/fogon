import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import { STALE_TIMES } from '@/lib/queryKeys';
import type { MealPlanEntry, MealSlot } from '@fogon/types';

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
      const { data } = await api.get(
        `/households/${household.id}/meal-plan?weekStart=${weekStart}`,
      );
      return data.data;
    },
    enabled: !!household,
    staleTime: STALE_TIMES.mealPlan,
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
      await api.post(`/households/${household!.id}/meal-plan`, {
        weekStart,
        dayOfWeek,
        slot,
        recipeId,
        customText,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan'] }),
  });
}

export function useClearMealSlot() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/households/${household!.id}/meal-plan/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plan'] }),
  });
}

export { getWeekStart };

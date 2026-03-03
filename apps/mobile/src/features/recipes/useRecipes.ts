import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import type { Recipe } from '@fogon/types';

export function useRecipes() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: ['recipes', household?.id],
    queryFn: async (): Promise<Recipe[]> => {
      if (!household) return [];
      const { data } = await api.get(`/households/${household.id}/recipes`);
      return data.data;
    },
    enabled: !!household,
  });
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  prepTimeMinutes?: number;
  isPublic?: boolean;
  ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
  steps: Array<{ description: string }>;
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (input: CreateRecipeInput) => {
      await api.post(`/households/${household!.id}/recipes`, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

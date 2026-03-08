import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import { STALE_TIMES } from '@/lib/queryKeys';
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
    staleTime: STALE_TIMES.recipes,
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
    mutationFn: async (input: CreateRecipeInput): Promise<{ id: string }> => {
      const { data } = await api.post(`/households/${household!.id}/recipes`, input);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useAddRecipeToShopping() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (recipeId: string): Promise<{ added: number }> => {
      const { data } = await api.post(
        `/households/${household!.id}/recipes/${recipeId}/add-to-shopping`,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopping_items'] });
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      await api.delete(`/households/${household!.id}/recipes/${recipeId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({ id, ...input }: CreateRecipeInput & { id: string }) => {
      await api.put(`/households/${household!.id}/recipes/${id}`, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

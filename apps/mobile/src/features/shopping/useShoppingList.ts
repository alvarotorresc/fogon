import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import { STALE_TIMES } from '@/lib/queryKeys';
import type { ShoppingItem } from '@fogon/types';

const QUERY_KEY = 'shopping_items';

export function useShoppingList() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: [QUERY_KEY, household?.id],
    queryFn: async (): Promise<ShoppingItem[]> => {
      if (!household) return [];
      const { data } = await api.get(`/households/${household.id}/shopping`);
      return data.data;
    },
    enabled: !!household,
    staleTime: STALE_TIMES.shopping,
  });
}

export function useAddShoppingItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({
      name,
      quantity,
      category,
    }: {
      name: string;
      quantity?: string;
      category: string;
    }) => {
      await api.post(`/households/${household!.id}/shopping`, {
        name,
        quantity: quantity || undefined,
        category,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export interface ToggleResult {
  pantryUpdated: boolean;
}

export function useToggleShoppingItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }): Promise<ToggleResult> => {
      const { data } = await api.patch(`/households/${household!.id}/shopping/${id}/toggle`, {
        isDone,
      });
      return data.data;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (result?.pantryUpdated) {
        qc.invalidateQueries({ queryKey: ['pantry_items'] });
      }
    },
  });
}

export function useClearDoneItems() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/households/${household!.id}/shopping/done`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteShoppingItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/households/${household!.id}/shopping/${itemId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateShoppingItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({ id, name, quantity }: { id: string; name: string; quantity?: string }) => {
      await api.patch(`/households/${household!.id}/shopping/${id}`, {
        name,
        quantity: quantity || undefined,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

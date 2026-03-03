import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
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
    refetchInterval: 5000,
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

export function useToggleShoppingItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      await api.patch(`/households/${household!.id}/shopping/${id}/toggle`, { isDone });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
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

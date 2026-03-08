import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import { STALE_TIMES } from '@/lib/queryKeys';
import type { PantryItem, StockLevel } from '@fogon/types';

const QUERY_KEY = 'pantry_items';

export function usePantry() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: [QUERY_KEY, household?.id],
    queryFn: async (): Promise<PantryItem[]> => {
      if (!household) return [];
      const { data } = await api.get(`/households/${household.id}/pantry`);
      return data.data;
    },
    enabled: !!household,
    staleTime: STALE_TIMES.pantry,
  });
}

export function useAddPantryItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({
      name,
      quantity,
      category,
      stockLevel,
    }: {
      name: string;
      quantity?: string;
      category: string;
      stockLevel: StockLevel;
    }) => {
      await api.post(`/households/${household!.id}/pantry`, {
        name,
        quantity: quantity || undefined,
        category,
        stockLevel,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

interface UpdateStockResult {
  addedToShoppingList: boolean;
}

export function useUpdateStockLevel() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async ({
      id,
      stockLevel,
    }: {
      id: string;
      stockLevel: StockLevel;
    }): Promise<UpdateStockResult> => {
      const { data } = await api.patch(`/households/${household!.id}/pantry/${id}/stock`, {
        stockLevel,
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['shopping_items'] });
    },
  });
}

export function useDeletePantryItem() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/households/${household!.id}/pantry/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

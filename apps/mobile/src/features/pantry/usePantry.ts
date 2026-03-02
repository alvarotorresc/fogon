import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import type { PantryItem, StockLevel } from '@fogon/types';

const QUERY_KEY = 'pantry_items';

export function usePantry() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: [QUERY_KEY, household?.id],
    queryFn: async (): Promise<PantryItem[]> => {
      if (!household) return [];

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('household_id', household.id)
        .order('name');

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        category: row.category,
        stockLevel: row.stock_level as StockLevel,
        updatedAt: row.updated_at,
      }));
    },
    enabled: !!household,
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('pantry_items').insert({
        household_id: household!.id,
        name,
        quantity: quantity || null,
        category,
        stock_level: stockLevel,
        added_by: user!.id,
      });

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateStockLevel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stockLevel }: { id: string; stockLevel: StockLevel }) => {
      const { error } = await supabase
        .from('pantry_items')
        .update({
          stock_level: stockLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeletePantryItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pantry_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

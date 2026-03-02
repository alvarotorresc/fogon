import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import type { ShoppingItem } from '@fogon/types';

const QUERY_KEY = 'shopping_items';

interface MemberRow {
  display_name: string;
  user_id: string;
}

export function useShoppingList() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: [QUERY_KEY, household?.id],
    queryFn: async (): Promise<ShoppingItem[]> => {
      if (!household) return [];

      const { data, error } = await supabase
        .from('shopping_items')
        .select('*, members:household_members(display_name, user_id)')
        .eq('household_id', household.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        category: row.category,
        isDone: row.is_done,
        doneByName: row.done_by
          ? (row.members as MemberRow[])?.find((m) => m.user_id === row.done_by)?.display_name ??
            null
          : null,
        addedByName:
          (row.members as MemberRow[])?.find((m) => m.user_id === row.added_by)?.display_name ??
          'Unknown',
        createdAt: row.created_at,
      }));
    },
    enabled: !!household,
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('shopping_items').insert({
        household_id: household!.id,
        name,
        quantity: quantity || null,
        category,
        added_by: user!.id,
      });

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useToggleShoppingItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('shopping_items')
        .update({
          is_done: isDone,
          done_by: isDone ? user!.id : null,
          done_at: isDone ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useClearDoneItems() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('household_id', household!.id)
        .eq('is_done', true);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

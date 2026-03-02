import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';

export function useRealtimeSync() {
  const { household } = useHouseholdStore();
  const qc = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!household) return;

    channelRef.current = supabase
      .channel(`shopping:${household.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_items',
          filter: `household_id=eq.${household.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['shopping_items', household.id] });
        },
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [household?.id, qc]);
}

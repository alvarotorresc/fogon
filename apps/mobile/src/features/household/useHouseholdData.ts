import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import type { HouseholdMember, HouseholdRole } from '@fogon/types';

interface RawMemberRow {
  id: string;
  user_id: string;
  display_name: string;
  avatar_color: string;
  role: string;
  joined_at: string;
}

export function useHouseholdMembers() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: ['household_members', household?.id],
    queryFn: async (): Promise<HouseholdMember[]> => {
      if (!household) return [];

      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', household.id)
        .order('joined_at');

      if (error) throw error;

      return (data ?? []).map((row) => {
        const r = row as unknown as RawMemberRow;
        return {
          id: r.id,
          userId: r.user_id,
          displayName: r.display_name,
          avatarColor: r.avatar_color,
          role: r.role as HouseholdRole,
          joinedAt: r.joined_at,
        };
      });
    },
    enabled: !!household,
  });
}

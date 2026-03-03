import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import type { HouseholdMember } from '@fogon/types';

export function useHouseholdMembers() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: ['household_members', household?.id],
    queryFn: async (): Promise<HouseholdMember[]> => {
      if (!household) return [];
      const { data } = await api.get(`/households/${household.id}/members`);
      return data.data;
    },
    enabled: !!household,
  });
}

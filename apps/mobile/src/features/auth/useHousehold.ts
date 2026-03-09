import { useState } from 'react';
import { api } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';
import type { Household } from '@fogon/types';

export function useCreateHousehold() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHousehold } = useHouseholdStore();

  const createHousehold = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ data: Household }>('/households', { name });
      setHousehold(data.data);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createHousehold, loading, error };
}

export function useLeaveHousehold() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { household, setHousehold } = useHouseholdStore();

  const leaveHousehold = async () => {
    if (!household) return false;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/households/${household.id}/leave`);
      setHousehold(null);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { leaveHousehold, loading, error };
}

export function useJoinHousehold() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setHousehold } = useHouseholdStore();

  const joinHousehold = async (inviteCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ data: Household }>('/households/join', { inviteCode });
      setHousehold(data.data);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { joinHousehold, loading, error };
}

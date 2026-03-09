import { create } from 'zustand';
import type { Household } from '@fogon/types';

interface HouseholdState {
  household: Household | null;
  setHousehold: (household: Household | null) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  household: null,
  setHousehold: (household) => set({ household }),
}));

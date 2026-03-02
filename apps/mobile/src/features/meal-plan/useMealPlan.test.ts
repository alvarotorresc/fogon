import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAssignMeal } from './useMealPlan';

const mockUpsert = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => ({
      upsert: (data: unknown, opts: unknown) => {
        mockUpsert(table, data, opts);
        return Promise.resolve({ error: null });
      },
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({
    household: { id: 'hh-456', name: 'Test Home', inviteCode: 'XYZ', members: [] },
  }),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('useAssignMeal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('should upsert meal plan entry with recipe id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignMeal(), { wrapper });

    await act(async () => {
      result.current.mutate({
        dayOfWeek: 0,
        slot: 'lunch' as const,
        recipeId: 'recipe-abc',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpsert).toHaveBeenCalledWith(
      'meal_plan_entries',
      expect.objectContaining({
        household_id: 'hh-456',
        day_of_week: 0,
        slot: 'lunch',
        recipe_id: 'recipe-abc',
        custom_text: null,
        created_by: 'user-1',
      }),
      { onConflict: 'household_id,week_start,day_of_week,slot' },
    );
  });

  it('should upsert meal plan entry with custom text', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignMeal(), { wrapper });

    await act(async () => {
      result.current.mutate({
        dayOfWeek: 3,
        slot: 'dinner' as const,
        customText: 'Pizza takeout',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpsert).toHaveBeenCalledWith(
      'meal_plan_entries',
      expect.objectContaining({
        household_id: 'hh-456',
        day_of_week: 3,
        slot: 'dinner',
        recipe_id: null,
        custom_text: 'Pizza takeout',
        created_by: 'user-1',
      }),
      { onConflict: 'household_id,week_start,day_of_week,slot' },
    );
  });

  it('should include week_start in YYYY-MM-DD format', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignMeal(), { wrapper });

    await act(async () => {
      result.current.mutate({
        dayOfWeek: 1,
        slot: 'lunch' as const,
        recipeId: 'recipe-xyz',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const upsertData = mockUpsert.mock.calls[0][1];
    expect(upsertData).toHaveProperty('week_start');
    expect(typeof upsertData.week_start).toBe('string');
    expect(upsertData.week_start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should set recipe_id to null when only custom text is provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAssignMeal(), { wrapper });

    await act(async () => {
      result.current.mutate({
        dayOfWeek: 5,
        slot: 'dinner' as const,
        customText: 'Leftovers',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const upsertData = mockUpsert.mock.calls[0][1];
    expect(upsertData.recipe_id).toBeNull();
    expect(upsertData.custom_text).toBe('Leftovers');
  });
});

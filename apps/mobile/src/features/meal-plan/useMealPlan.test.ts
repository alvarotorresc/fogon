import { renderHook, act } from '@testing-library/react-native';
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

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  const queryClient = new actual.QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return {
    ...actual,
    useQueryClient: () => queryClient,
    useMutation: (opts: { mutationFn: (...args: unknown[]) => Promise<unknown>; onSuccess?: () => void }) => {
      return {
        mutate: async (input: unknown) => {
          await opts.mutationFn(input);
          opts.onSuccess?.();
        },
        mutateAsync: async (input: unknown) => {
          await opts.mutationFn(input);
          opts.onSuccess?.();
        },
        isPending: false,
      };
    },
  };
});

describe('useAssignMeal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('upserts meal plan entry with recipe id', async () => {
    const { result } = renderHook(() => useAssignMeal());

    await act(async () => {
      await result.current.mutateAsync({
        dayOfWeek: 0,
        slot: 'lunch' as const,
        recipeId: 'recipe-abc',
      });
    });

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

  it('upserts meal plan entry with custom text', async () => {
    const { result } = renderHook(() => useAssignMeal());

    await act(async () => {
      await result.current.mutateAsync({
        dayOfWeek: 3,
        slot: 'dinner' as const,
        customText: 'Pizza takeout',
      });
    });

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

  it('includes week_start in upsert', async () => {
    const { result } = renderHook(() => useAssignMeal());

    await act(async () => {
      await result.current.mutateAsync({
        dayOfWeek: 1,
        slot: 'lunch' as const,
        recipeId: 'recipe-xyz',
      });
    });

    const upsertData = mockUpsert.mock.calls[0][1];
    expect(upsertData).toHaveProperty('week_start');
    expect(typeof upsertData.week_start).toBe('string');
    // week_start should be a date string like YYYY-MM-DD
    expect(upsertData.week_start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('sets recipe_id to null when only custom text is provided', async () => {
    const { result } = renderHook(() => useAssignMeal());

    await act(async () => {
      await result.current.mutateAsync({
        dayOfWeek: 5,
        slot: 'dinner' as const,
        customText: 'Leftovers',
      });
    });

    const upsertData = mockUpsert.mock.calls[0][1];
    expect(upsertData.recipe_id).toBeNull();
    expect(upsertData.custom_text).toBe('Leftovers');
  });
});

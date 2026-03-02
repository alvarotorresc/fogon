import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCreateRecipe } from './useRecipes';

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === 'recipes') {
        return {
          insert: (data: unknown) => {
            mockInsert(table, data);
            return {
              select: () => {
                mockSelect();
                return { single: () => mockSingle() };
              },
            };
          },
          select: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        insert: (data: unknown) => {
          mockInsert(table, data);
          return Promise.resolve({ error: null });
        },
      };
    },
  },
}));

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({
    household: { id: 'hh-123', name: 'Test Household', inviteCode: 'ABC', members: [] },
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
      let isPending = false;
      return {
        mutateAsync: async (input: unknown) => {
          isPending = true;
          try {
            await opts.mutationFn(input);
            opts.onSuccess?.();
          } finally {
            isPending = false;
          }
        },
        isPending,
      };
    },
  };
});

describe('useCreateRecipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSingle.mockResolvedValue({
      data: { id: 'recipe-1', household_id: 'hh-123', title: 'Test' },
      error: null,
    });
  });

  it('inserts recipe with correct data', async () => {
    const { result } = renderHook(() => useCreateRecipe());

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Pasta Carbonara',
        description: 'Classic Italian pasta',
        prepTimeMinutes: 30,
        isPublic: false,
        ingredients: [{ name: 'Spaghetti', quantity: '400', unit: 'g' }],
        steps: [{ description: 'Boil pasta' }],
      });
    });

    expect(mockInsert).toHaveBeenCalledWith('recipes', {
      household_id: 'hh-123',
      title: 'Pasta Carbonara',
      description: 'Classic Italian pasta',
      prep_time_minutes: 30,
      is_public: false,
      created_by: 'user-1',
    });
  });

  it('inserts ingredients with correct positions', async () => {
    const { result } = renderHook(() => useCreateRecipe());

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Test Recipe',
        ingredients: [
          { name: 'Flour', quantity: '200', unit: 'g' },
          { name: 'Sugar', quantity: '100', unit: 'g' },
        ],
        steps: [],
      });
    });

    expect(mockInsert).toHaveBeenCalledWith('recipe_ingredients', [
      { recipe_id: 'recipe-1', name: 'Flour', quantity: '200', unit: 'g', position: 0 },
      { recipe_id: 'recipe-1', name: 'Sugar', quantity: '100', unit: 'g', position: 1 },
    ]);
  });

  it('inserts steps with correct step numbers', async () => {
    const { result } = renderHook(() => useCreateRecipe());

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Test Recipe',
        ingredients: [],
        steps: [{ description: 'Step one' }, { description: 'Step two' }],
      });
    });

    expect(mockInsert).toHaveBeenCalledWith('recipe_steps', [
      { recipe_id: 'recipe-1', step_number: 1, description: 'Step one' },
      { recipe_id: 'recipe-1', step_number: 2, description: 'Step two' },
    ]);
  });

  it('skips ingredients insert when list is empty', async () => {
    const { result } = renderHook(() => useCreateRecipe());

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Minimal Recipe',
        ingredients: [],
        steps: [],
      });
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith('recipes', expect.objectContaining({ title: 'Minimal Recipe' }));
  });

  it('throws when recipe insert fails', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    });

    const { result } = renderHook(() => useCreateRecipe());

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          title: 'Bad Recipe',
          ingredients: [],
          steps: [],
        });
      }),
    ).rejects.toEqual(expect.objectContaining({ message: 'Insert failed' }));
  });
});

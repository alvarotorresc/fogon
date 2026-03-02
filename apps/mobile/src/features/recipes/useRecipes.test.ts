import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
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

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('useCreateRecipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSingle.mockResolvedValue({
      data: { id: 'recipe-1', household_id: 'hh-123', title: 'Test' },
      error: null,
    });
  });

  it('should insert recipe with correct data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: 'Pasta Carbonara',
        description: 'Classic Italian pasta',
        prepTimeMinutes: 30,
        isPublic: false,
        ingredients: [{ name: 'Spaghetti', quantity: '400', unit: 'g' }],
        steps: [{ description: 'Boil pasta' }],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith('recipes', {
      household_id: 'hh-123',
      title: 'Pasta Carbonara',
      description: 'Classic Italian pasta',
      prep_time_minutes: 30,
      is_public: false,
      created_by: 'user-1',
    });
  });

  it('should insert ingredients with correct positions', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: 'Test Recipe',
        ingredients: [
          { name: 'Flour', quantity: '200', unit: 'g' },
          { name: 'Sugar', quantity: '100', unit: 'g' },
        ],
        steps: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith('recipe_ingredients', [
      { recipe_id: 'recipe-1', name: 'Flour', quantity: '200', unit: 'g', position: 0 },
      { recipe_id: 'recipe-1', name: 'Sugar', quantity: '100', unit: 'g', position: 1 },
    ]);
  });

  it('should insert steps with correct step numbers', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: 'Test Recipe',
        ingredients: [],
        steps: [{ description: 'Step one' }, { description: 'Step two' }],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith('recipe_steps', [
      { recipe_id: 'recipe-1', step_number: 1, description: 'Step one' },
      { recipe_id: 'recipe-1', step_number: 2, description: 'Step two' },
    ]);
  });

  it('should skip ingredients insert when list is empty', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: 'Minimal Recipe',
        ingredients: [],
        steps: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith(
      'recipes',
      expect.objectContaining({ title: 'Minimal Recipe' }),
    );
  });

  it('should throw when recipe insert fails', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: 'Bad Recipe',
        ingredients: [],
        steps: [],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(expect.objectContaining({ message: 'Insert failed' }));
  });
});

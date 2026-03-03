import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useCreateRecipe } from './useRecipes';

const mockPost = jest.fn().mockResolvedValue({ data: { data: { id: 'recipe-1' } } });

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    post: (...args: unknown[]) => mockPost(...args),
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
  beforeEach(() => jest.clearAllMocks());

  it('should post recipe with correct data', async () => {
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

    expect(mockPost).toHaveBeenCalledWith('/households/hh-123/recipes', {
      title: 'Pasta Carbonara',
      description: 'Classic Italian pasta',
      prepTimeMinutes: 30,
      isPublic: false,
      ingredients: [{ name: 'Spaghetti', quantity: '400', unit: 'g' }],
      steps: [{ description: 'Boil pasta' }],
    });
  });

  it('should post minimal recipe', async () => {
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

    expect(mockPost).toHaveBeenCalledWith('/households/hh-123/recipes', {
      title: 'Minimal Recipe',
      ingredients: [],
      steps: [],
    });
  });

  it('should handle API error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));
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
    expect(result.current.error?.message).toBe('Network error');
  });
});

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useCreateRecipe, useAddRecipeToShopping, useDeleteRecipe, useUpdateRecipe } from './useRecipes';

const mockPost = jest.fn().mockResolvedValue({ data: { data: { id: 'recipe-1' } } });
const mockDelete = jest.fn().mockResolvedValue({ data: { data: null } });
const mockPut = jest.fn().mockResolvedValue({ data: { data: { id: 'recipe-1' } } });

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    put: (...args: unknown[]) => mockPut(...args),
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

describe('useAddRecipeToShopping', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should post to add-to-shopping endpoint and return result', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { added: 3 } } });
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddRecipeToShopping(), { wrapper });

    await act(async () => {
      result.current.mutate('recipe-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith(
      '/households/hh-123/recipes/recipe-1/add-to-shopping',
    );
    expect(result.current.data).toEqual({ added: 3 });
  });

  it('should handle zero added (all duplicates)', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { added: 0 } } });
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddRecipeToShopping(), { wrapper });

    await act(async () => {
      result.current.mutate('recipe-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ added: 0 });
  });

  it('should handle API error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Server error'));
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddRecipeToShopping(), { wrapper });

    await act(async () => {
      result.current.mutate('recipe-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Server error');
  });
});

describe('useDeleteRecipe', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call DELETE with recipe ID', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate('recipe-42');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalledWith('/households/hh-123/recipes/recipe-42');
  });

  it('should handle delete error', async () => {
    mockDelete.mockRejectedValueOnce(new Error('Not found'));
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate('bad-id');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Not found');
  });
});

describe('useUpdateRecipe', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT with recipe data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        id: 'recipe-1',
        title: 'Updated Pasta',
        description: 'Better',
        ingredients: [{ name: 'Flour' }],
        steps: [{ description: 'Mix' }],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPut).toHaveBeenCalledWith('/households/hh-123/recipes/recipe-1', {
      title: 'Updated Pasta',
      description: 'Better',
      ingredients: [{ name: 'Flour' }],
      steps: [{ description: 'Mix' }],
    });
  });

  it('should handle update error', async () => {
    mockPut.mockRejectedValueOnce(new Error('Server error'));
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

    await act(async () => {
      result.current.mutate({
        id: 'recipe-1',
        title: 'Bad',
        ingredients: [],
        steps: [],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Server error');
  });
});

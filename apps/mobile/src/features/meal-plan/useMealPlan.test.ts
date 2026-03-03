import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAssignMeal, useClearMealSlot } from './useMealPlan';

const mockPost = jest.fn().mockResolvedValue({ data: { data: null } });
const mockDelete = jest.fn().mockResolvedValue({ data: { data: null } });

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
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
  beforeEach(() => jest.clearAllMocks());

  it('should post meal assignment with recipe id', async () => {
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

    expect(mockPost).toHaveBeenCalledWith(
      '/households/hh-456/meal-plan',
      expect.objectContaining({
        dayOfWeek: 0,
        slot: 'lunch',
        recipeId: 'recipe-abc',
      }),
    );
  });

  it('should post meal assignment with custom text', async () => {
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

    expect(mockPost).toHaveBeenCalledWith(
      '/households/hh-456/meal-plan',
      expect.objectContaining({
        dayOfWeek: 3,
        slot: 'dinner',
        customText: 'Pizza takeout',
      }),
    );
  });

  it('should include weekStart in YYYY-MM-DD format', async () => {
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

    const body = mockPost.mock.calls[0][1];
    expect(body).toHaveProperty('weekStart');
    expect(typeof body.weekStart).toBe('string');
    expect(body.weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('useClearMealSlot', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call DELETE for meal entry', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useClearMealSlot(), { wrapper });

    await act(async () => {
      result.current.mutate('mp-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalledWith('/households/hh-456/meal-plan/mp-1');
  });
});

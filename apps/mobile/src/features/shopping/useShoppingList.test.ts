import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAddShoppingItem, useToggleShoppingItem } from './useShoppingList';

const mockInsert = jest.fn().mockReturnValue({ error: null });
const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null }) });
const mockGetUser = jest.fn().mockResolvedValue({
  data: { user: { id: 'user-123' } },
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert,
      update: (payload: Record<string, unknown>) => {
        mockUpdate(payload);
        return {
          eq: jest.fn().mockReturnValue({ error: null }),
        };
      },
    })),
    auth: {
      getUser: () => mockGetUser(),
    },
  },
}));

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({
    household: { id: 'household-abc', name: 'Test Home', inviteCode: 'ABC', members: [] },
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

describe('useAddShoppingItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inserts with correct params', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ name: 'Milk', quantity: '2L', category: 'lacteos' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith({
      household_id: 'household-abc',
      name: 'Milk',
      quantity: '2L',
      category: 'lacteos',
      added_by: 'user-123',
    });
  });

  it('sets quantity to null when empty', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ name: 'Bread', category: 'panaderia' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bread',
        quantity: null,
        category: 'panaderia',
      }),
    );
  });
});

describe('useToggleShoppingItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates is_done, done_by, done_at when marking done', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'item-1', isDone: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        is_done: true,
        done_by: 'user-123',
      }),
    );

    const call = mockUpdate.mock.calls[0][0];
    expect(call.done_at).toBeDefined();
    expect(typeof call.done_at).toBe('string');
  });

  it('clears done_by and done_at when unmarking', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'item-1', isDone: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdate).toHaveBeenCalledWith({
      is_done: false,
      done_by: null,
      done_at: null,
    });
  });
});

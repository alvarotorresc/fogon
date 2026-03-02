import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useUpdateStockLevel } from './usePantry';

const mockUpdate = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: (payload: Record<string, unknown>) => {
        mockUpdate(payload);
        return {
          eq: jest.fn().mockReturnValue({ error: null }),
        };
      },
    })),
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

describe('useUpdateStockLevel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls update with correct stock_level and updated_at', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateStockLevel(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'pantry-1', stockLevel: 'low' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        stock_level: 'low',
      }),
    );

    const call = mockUpdate.mock.calls[0][0];
    expect(call.updated_at).toBeDefined();
    expect(typeof call.updated_at).toBe('string');
  });

  it('updates to empty stock level', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateStockLevel(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'pantry-2', stockLevel: 'empty' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        stock_level: 'empty',
      }),
    );
  });

  it('updates to ok stock level', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateStockLevel(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'pantry-3', stockLevel: 'ok' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        stock_level: 'ok',
      }),
    );
  });
});

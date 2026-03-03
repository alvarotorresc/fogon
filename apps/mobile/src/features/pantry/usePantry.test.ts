import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useUpdateStockLevel, useDeletePantryItem } from './usePantry';

const mockPatch = jest.fn().mockResolvedValue({ data: { data: null } });
const mockDelete = jest.fn().mockResolvedValue({ data: { data: null } });

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { data: null } }),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
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

  it('calls PATCH with correct stock level', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateStockLevel(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'pantry-1', stockLevel: 'low' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith(
      '/households/household-abc/pantry/pantry-1/stock',
      { stockLevel: 'low' },
    );
  });

  it('calls PATCH with empty stock level', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateStockLevel(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'pantry-2', stockLevel: 'empty' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith(
      '/households/household-abc/pantry/pantry-2/stock',
      { stockLevel: 'empty' },
    );
  });

  it('calls PATCH with ok stock level', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateStockLevel(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'pantry-3', stockLevel: 'ok' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith(
      '/households/household-abc/pantry/pantry-3/stock',
      { stockLevel: 'ok' },
    );
  });
});

describe('useDeletePantryItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls DELETE with correct item id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeletePantryItem(), { wrapper });

    await act(async () => {
      result.current.mutate('pantry-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalledWith('/households/household-abc/pantry/pantry-1');
  });
});

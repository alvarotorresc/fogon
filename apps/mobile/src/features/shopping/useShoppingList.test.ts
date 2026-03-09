import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  useAddShoppingItem,
  useToggleShoppingItem,
  useClearDoneItems,
  useDeleteShoppingItem,
  useUpdateShoppingItem,
} from './useShoppingList';

const mockPost = jest.fn().mockResolvedValue({ data: { data: null } });
const mockPatch = jest.fn().mockResolvedValue({ data: { data: { pantryUpdated: false } } });
const mockDelete = jest.fn().mockResolvedValue({ data: { data: null } });

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    post: (...args: unknown[]) => mockPost(...args),
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

describe('useAddShoppingItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls API with correct params', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ name: 'Milk', quantity: '2L', category: 'lacteos' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/households/household-abc/shopping', {
      name: 'Milk',
      quantity: '2L',
      category: 'lacteos',
    });
  });

  it('omits quantity when empty', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ name: 'Bread', category: 'panaderia' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPost).toHaveBeenCalledWith('/households/household-abc/shopping', {
      name: 'Bread',
      quantity: undefined,
      category: 'panaderia',
    });
  });
});

describe('useToggleShoppingItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls PATCH with isDone true', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'item-1', isDone: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith(
      '/households/household-abc/shopping/item-1/toggle',
      { isDone: true },
    );
  });

  it('calls PATCH with isDone false', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'item-1', isDone: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith(
      '/households/household-abc/shopping/item-1/toggle',
      { isDone: false },
    );
  });
});

describe('useClearDoneItems', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls DELETE on done endpoint', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useClearDoneItems(), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalledWith('/households/household-abc/shopping/done');
  });
});

describe('useDeleteShoppingItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls DELETE with item ID', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate('item-42');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalledWith('/households/household-abc/shopping/item-42');
  });
});

describe('useUpdateShoppingItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls PATCH with name and quantity', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'item-1', name: 'Updated Milk', quantity: '3L' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith('/households/household-abc/shopping/item-1', {
      name: 'Updated Milk',
      quantity: '3L',
    });
  });

  it('omits quantity when empty', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateShoppingItem(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'item-1', name: 'Just Name' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith('/households/household-abc/shopping/item-1', {
      name: 'Just Name',
      quantity: undefined,
    });
  });
});

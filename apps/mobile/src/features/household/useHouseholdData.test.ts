import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useHouseholdMembers } from './useHouseholdData';

const mockGet = jest.fn();

jest.mock('@/lib/api', () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
}));

const mockHouseholdStore = jest.fn();
jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => mockHouseholdStore(),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('useHouseholdMembers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return empty array when no household exists', async () => {
    mockHouseholdStore.mockReturnValue({ household: null });

    const { result } = renderHook(() => useHouseholdMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should fetch members when household exists', async () => {
    mockHouseholdStore.mockReturnValue({
      household: { id: 'h-1', name: 'Home', inviteCode: 'ABC', members: [] },
    });
    mockGet.mockResolvedValue({
      data: {
        data: [
          { id: 'u-1', name: 'Alice', role: 'admin' },
          { id: 'u-2', name: 'Bob', role: 'member' },
        ],
      },
    });

    const { result } = renderHook(() => useHouseholdMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith('/households/h-1/members');
    expect(result.current.data).toEqual([
      { id: 'u-1', name: 'Alice', role: 'admin' },
      { id: 'u-2', name: 'Bob', role: 'member' },
    ]);
  });

  it('should map response data correctly from nested data property', async () => {
    mockHouseholdStore.mockReturnValue({
      household: { id: 'h-2', name: 'Family', inviteCode: 'XYZ', members: [] },
    });
    mockGet.mockResolvedValue({
      data: { data: [{ id: 'm-1', displayName: 'Carlos', avatarUrl: null }] },
    });

    const { result } = renderHook(() => useHouseholdMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]).toEqual({ id: 'm-1', displayName: 'Carlos', avatarUrl: null });
  });
});

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useShoppingSocket } from './useShoppingSocket';
import { SHOPPING_EVENTS } from '@fogon/types';

const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockDisconnect = jest.fn();
const mockIo = jest.fn();

jest.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => {
    mockIo(...args);
    return {
      on: mockOn,
      emit: mockEmit,
      disconnect: mockDisconnect,
    };
  },
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'test-jwt-token' } },
      }),
    },
  },
}));

const mockHousehold = { id: 'household-abc', name: 'Test Home', inviteCode: 'ABC', members: [] };

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({
    household: mockHousehold,
  }),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe('useShoppingSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to WebSocket with auth token when household exists', async () => {
    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    await waitFor(() => {
      expect(mockIo).toHaveBeenCalledWith(
        expect.stringContaining('/shopping'),
        expect.objectContaining({
          auth: { token: 'test-jwt-token' },
          transports: ['websocket'],
        }),
      );
    });
  });

  it('should join household room when socket connects', async () => {
    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
    });

    const connectCall = mockOn.mock.calls.find(
      (call: [string, () => void]) => call[0] === 'connect',
    );
    expect(connectCall).toBeDefined();

    connectCall![1]();

    expect(mockEmit).toHaveBeenCalledWith(SHOPPING_EVENTS.JOIN_HOUSEHOLD, {
      householdId: 'household-abc',
    });
  });

  it('should register listeners for all shopping events when connected', async () => {
    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
    });

    const registeredEvents = mockOn.mock.calls.map((call: [string, () => void]) => call[0]);

    expect(registeredEvents).toContain(SHOPPING_EVENTS.CREATED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.TOGGLED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.UPDATED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.DELETED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.CLEARED);
  });

  it('should disconnect socket when component unmounts', async () => {
    const wrapper = createWrapper();
    const { unmount } = renderHook(() => useShoppingSocket(), { wrapper });

    await waitFor(() => {
      expect(mockIo).toHaveBeenCalled();
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should not connect when household is null', async () => {
    const householdStoreMock = jest.requireMock('@/store/householdStore');
    const original = householdStoreMock.useHouseholdStore;
    householdStoreMock.useHouseholdStore = () => ({ household: null });

    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    // Give the effect a chance to run (if it would)
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockIo).not.toHaveBeenCalled();

    householdStoreMock.useHouseholdStore = original;
  });

  it('should not connect when session has no access_token', async () => {
    const supabaseMock = jest.requireMock('@/lib/supabase');
    supabaseMock.supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
    });

    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    // Give the effect a chance to run
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockIo).not.toHaveBeenCalled();
  });
});

import { renderHook } from '@testing-library/react-native';
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

  it('connects to WebSocket with auth token', async () => {
    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    // Wait for async connect
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockIo).toHaveBeenCalledWith(
      expect.stringContaining('/shopping'),
      expect.objectContaining({
        auth: { token: 'test-jwt-token' },
        transports: ['websocket'],
      }),
    );
  });

  it('joins household room on connect', async () => {
    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Find the 'connect' handler and call it
    const connectCall = mockOn.mock.calls.find(
      (call: [string, () => void]) => call[0] === 'connect',
    );
    expect(connectCall).toBeDefined();

    connectCall![1]();

    expect(mockEmit).toHaveBeenCalledWith(SHOPPING_EVENTS.JOIN_HOUSEHOLD, {
      householdId: 'household-abc',
    });
  });

  it('registers listeners for all shopping events', async () => {
    const wrapper = createWrapper();
    renderHook(() => useShoppingSocket(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const registeredEvents = mockOn.mock.calls.map((call: [string, () => void]) => call[0]);

    expect(registeredEvents).toContain(SHOPPING_EVENTS.CREATED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.TOGGLED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.UPDATED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.DELETED);
    expect(registeredEvents).toContain(SHOPPING_EVENTS.CLEARED);
  });

  it('disconnects socket on unmount', async () => {
    const wrapper = createWrapper();
    const { unmount } = renderHook(() => useShoppingSocket(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 10));

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});

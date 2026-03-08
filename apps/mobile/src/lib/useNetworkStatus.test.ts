import { renderHook, act } from '@testing-library/react-native';
import { onlineManager } from '@tanstack/react-query';
import { useNetworkStatus } from './useNetworkStatus';

type NetInfoCallback = (state: { isConnected: boolean | null }) => void;

const mockUnsubscribe = jest.fn();
let netInfoCallback: NetInfoCallback | null = null;

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: (callback: NetInfoCallback) => {
    netInfoCallback = callback;
    return mockUnsubscribe;
  },
}));

jest.mock('@tanstack/react-query', () => ({
  onlineManager: {
    setOnline: jest.fn(),
  },
}));

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    netInfoCallback = null;
  });

  it('should default to connected', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(true);
  });

  it('should update to offline when network disconnects', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      netInfoCallback?.({ isConnected: false });
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should sync onlineManager when going offline', () => {
    renderHook(() => useNetworkStatus());

    act(() => {
      netInfoCallback?.({ isConnected: false });
    });

    expect(onlineManager.setOnline).toHaveBeenCalledWith(false);
  });

  it('should sync onlineManager when coming back online', () => {
    renderHook(() => useNetworkStatus());

    act(() => {
      netInfoCallback?.({ isConnected: false });
    });
    act(() => {
      netInfoCallback?.({ isConnected: true });
    });

    expect(onlineManager.setOnline).toHaveBeenLastCalledWith(true);
  });

  it('should treat null isConnected as connected', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      netInfoCallback?.({ isConnected: null });
    });

    expect(result.current.isConnected).toBe(true);
    expect(onlineManager.setOnline).toHaveBeenCalledWith(true);
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePushNotifications } from './usePushNotifications';
import { useAuthStore } from '@/store/authStore';
import { useHouseholdStore } from '@/store/householdStore';

const mockPost = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockAddNotificationReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
const mockSetNotificationHandler = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  getExpoPushTokenAsync: (...args: unknown[]) => mockGetExpoPushTokenAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) =>
    mockSetNotificationChannelAsync(...args),
  addNotificationReceivedListener: (...args: unknown[]) =>
    mockAddNotificationReceivedListener(...args),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        eas: { projectId: 'test-project-id' },
      },
    },
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ session: null, user: null });
    useHouseholdStore.setState({ household: null });
  });

  it('does not register when there is no session', () => {
    renderHook(() => usePushNotifications());

    expect(mockPost).not.toHaveBeenCalled();
  });

  it('does not register when there is no household', () => {
    useAuthStore.setState({
      session: { access_token: 'token' } as never,
      user: { id: 'user-1' } as never,
    });

    renderHook(() => usePushNotifications());

    expect(mockPost).not.toHaveBeenCalled();
  });

  it('registers push token when session and household exist', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[test123]',
    });
    mockPost.mockResolvedValue({ data: { data: null } });

    useAuthStore.setState({
      session: { access_token: 'token' } as never,
      user: { id: 'user-1' } as never,
    });
    useHouseholdStore.setState({
      household: { id: 'h-1', name: 'Test' } as never,
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/notifications/register-token', {
        token: 'ExponentPushToken[test123]',
      });
    });
  });

  it('requests permission if not already granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[test123]',
    });
    mockPost.mockResolvedValue({ data: { data: null } });

    useAuthStore.setState({
      session: { access_token: 'token' } as never,
      user: { id: 'user-1' } as never,
    });
    useHouseholdStore.setState({
      household: { id: 'h-1', name: 'Test' } as never,
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(mockRequestPermissionsAsync).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalled();
    });
  });

  it('does not register when permission is denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    useAuthStore.setState({
      session: { access_token: 'token' } as never,
      user: { id: 'user-1' } as never,
    });
    useHouseholdStore.setState({
      household: { id: 'h-1', name: 'Test' } as never,
    });

    renderHook(() => usePushNotifications());

    // Give time for async operations
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it('unregisterToken calls DELETE endpoint', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[test123]',
    });
    mockPost.mockResolvedValue({ data: { data: null } });
    mockDelete.mockResolvedValue({ data: { data: null } });

    useAuthStore.setState({
      session: { access_token: 'token' } as never,
      user: { id: 'user-1' } as never,
    });
    useHouseholdStore.setState({
      household: { id: 'h-1', name: 'Test' } as never,
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.unregisterToken();
    });

    expect(mockDelete).toHaveBeenCalledWith('/notifications/unregister-token', {
      data: { token: 'ExponentPushToken[test123]' },
    });
  });
});

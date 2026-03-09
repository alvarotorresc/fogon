import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useHouseholdStore } from '@/store/householdStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

export function usePushNotifications() {
  const session = useAuthStore((state) => state.session);
  const household = useHouseholdStore((state) => state.household);
  const tokenRef = useRef<string | null>(null);

  const registerToken = useCallback(async () => {
    try {
      const token = await getExpoPushToken();
      if (!token) return;

      tokenRef.current = token;
      await api.post('/notifications/register-token', { token });
    } catch {
      // Silently fail — notifications are not critical
    }
  }, []);

  const unregisterToken = useCallback(async () => {
    if (!tokenRef.current) return;

    try {
      await api.delete('/notifications/unregister-token', {
        data: { token: tokenRef.current },
      });
      tokenRef.current = null;
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (!session || !household) return;

    registerToken();

    const foregroundSubscription = Notifications.addNotificationReceivedListener(() => {
      // Notification received in foreground — no-op for now
      // The notification handler above controls display behavior
    });

    return () => {
      foregroundSubscription.remove();
    };
  }, [session, household, registerToken]);

  return { unregisterToken };
}

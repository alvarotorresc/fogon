import '../global.css';
import '../src/lib/i18n';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '@/lib/queryClient';
import { persistOptions } from '@/lib/queryPersister';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useThemeSync } from '@/store/useThemeSync';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { OfflineBanner } from '@/components/OfflineBanner';
import { usePushNotifications } from '@/features/notifications/usePushNotifications';

export default function RootLayout() {
  const { setSession, setLoading } = useAuthStore();
  const { colorScheme } = useColorScheme();

  useThemeSync();
  usePushNotifications();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <View className="flex-1">
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }} />
        <ErrorToast />
      </View>
    </PersistQueryClientProvider>
  );
}

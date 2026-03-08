import '../global.css';
import '../src/lib/i18n';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useThemeSync } from '@/store/useThemeSync';
import { ErrorToast } from '@/components/ui/ErrorToast';

export default function RootLayout() {
  const { setSession, setLoading } = useAuthStore();
  const { colorScheme } = useColorScheme();

  useThemeSync();

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
    <QueryClientProvider client={queryClient}>
      <View className="flex-1">
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
        <ErrorToast />
      </View>
    </QueryClientProvider>
  );
}

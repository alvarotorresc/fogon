import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useHouseholdStore } from '@/store/householdStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, isLoading } = useAuthStore();
  const { household } = useHouseholdStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-primary">
        <ActivityIndicator color="#EA580C" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!household) return <Redirect href="/(auth)/create-household" />;
  return <Redirect href="/(tabs)/list" />;
}

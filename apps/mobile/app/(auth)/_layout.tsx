import { Stack } from 'expo-router';
import { useColors } from '@/constants/useColors';

export default function AuthLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
        animation: 'slide_from_right',
      }}
    />
  );
}

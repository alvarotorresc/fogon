import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/lib/useNetworkStatus';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { t } = useTranslation();

  if (isConnected) return null;

  return (
    <View
      className="bg-amber-600 px-4 py-2 flex-row items-center justify-center gap-2"
      accessibilityRole="alert"
      accessibilityLabel={t('offline.banner')}
    >
      <WifiOff size={16} color="white" />
      <Text className="text-white text-sm font-medium">{t('offline.banner')}</Text>
    </View>
  );
}

import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJoinHousehold } from '@/features/auth/useHousehold';
import { COLORS } from '@/constants/colors';

export default function JoinHouseholdScreen() {
  const { t } = useTranslation();
  const { joinHousehold, loading, error } = useJoinHousehold();
  const [code, setCode] = useState('');

  const handleJoin = async () => {
    const ok = await joinHousehold(code.trim().toUpperCase());
    if (ok) router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-primary"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-12">
          <View className="w-16 h-16 rounded-2xl bg-bg-elevated items-center justify-center">
            <Users color={COLORS.terracota} size={32} />
          </View>
          <Text className="text-text-primary text-2xl font-bold mt-4">{t('household.join')}</Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('household.invite_code')}
            value={code}
            onChangeText={setCode}
            placeholder="ABCD1234"
            autoCapitalize="characters"
            maxLength={8}
          />

          {error && <Text className="text-error text-sm text-center">{error}</Text>}

          <Button onPress={handleJoin} loading={loading} disabled={!code.trim()}>
            {t('household.join')}
          </Button>

          <View className="flex-row justify-center mt-4">
            <Link
              href="/(auth)/create-household"
              className="text-brand-blue text-sm font-semibold"
            >
              {t('household.create')}
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

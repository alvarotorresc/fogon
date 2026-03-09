import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateHousehold } from '@/features/auth/useHousehold';
import { useColors } from '@/constants/useColors';

export default function CreateHouseholdScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { createHousehold, loading, error } = useCreateHousehold();
  const [name, setName] = useState('');

  const handleCreate = async () => {
    const ok = await createHousehold(name.trim());
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
            <Home color={colors.terracota} size={32} />
          </View>
          <Text className="text-text-primary text-2xl font-bold mt-4">
            {t('household.create')}
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('household.name')}
            value={name}
            onChangeText={setName}
            placeholder="Mi hogar"
            autoCapitalize="sentences"
          />

          {error && <Text className="text-error text-sm text-center">{error}</Text>}

          <Button onPress={handleCreate} loading={loading} disabled={!name.trim()}>
            {t('household.create')}
          </Button>

          <View className="flex-row justify-center mt-4">
            <Link href="/(auth)/join-household" className="text-brand-blue text-sm font-semibold">
              {t('household.join')}
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

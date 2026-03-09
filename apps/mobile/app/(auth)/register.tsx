import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/features/auth/useAuth';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register, loading, error } = useRegister();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const ok = await register(email.trim(), password, displayName.trim());
    if (ok) router.replace('/(auth)/create-household');
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
          <Logo size={64} />
          <Text className="text-text-primary text-3xl font-bold mt-4">Fogon</Text>
          <Text className="text-text-secondary text-base mt-2">{t('auth.register_title')}</Text>
        </View>

        <View className="gap-4">
          <Input
            label={t('auth.name')}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
          />
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          {error && <Text className="text-error text-sm text-center">{error}</Text>}

          <Button
            onPress={handleRegister}
            loading={loading}
            disabled={!displayName || !email || !password}
          >
            {t('auth.register')}
          </Button>

          <View className="flex-row justify-center mt-4">
            <Text className="text-text-secondary text-sm">{t('auth.have_account')} </Text>
            <Link href="/(auth)/login" className="text-brand-blue text-sm font-semibold">
              {t('auth.login')}
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

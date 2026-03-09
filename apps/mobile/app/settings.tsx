import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Globe, Bell, Info, Palette, User, ExternalLink } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useColors } from '@/constants/useColors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSettings, useUpdateDisplayName } from '@/features/settings/useSettings';

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-text-tertiary text-xs font-semibold uppercase tracking-wider px-4 pt-6 pb-2">
      {title}
    </Text>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-4 bg-bg-secondary rounded-xl border border-border overflow-hidden">
      {children}
    </View>
  );
}

function SectionRow({
  icon,
  label,
  value,
  onPress,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={`flex-row items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-border-subtle' : ''}`}
      >
        {({ pressed }) => (
          <View
            className="flex-row items-center gap-3 flex-1"
            style={{ opacity: pressed ? 0.7 : 1 }}
          >
            {icon}
            <Text className="text-text-primary text-base flex-1">{label}</Text>
            {value && <Text className="text-text-secondary text-sm">{value}</Text>}
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-border-subtle' : ''}`}
    >
      {icon}
      <Text className="text-text-primary text-base flex-1">{label}</Text>
      {value && <Text className="text-text-secondary text-sm">{value}</Text>}
    </View>
  );
}

function LanguageOption({
  label,
  isSelected,
  onPress,
  isLast = false,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      className={`flex-row items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-border-subtle' : ''}`}
    >
      {({ pressed }) => (
        <View
          className="flex-row items-center gap-3 flex-1"
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? 'border-brand-terracota' : 'border-text-tertiary'
            }`}
          >
            {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-brand-terracota" />}
          </View>
          <Text className="text-text-primary text-base">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function ProfileSection() {
  const { t } = useTranslation();
  const colors = useColors();
  const { userEmail, userDisplayName } = useSettings();
  const { updateDisplayName, isLoading, isSuccess } = useUpdateDisplayName();
  const [name, setName] = useState(userDisplayName);

  const handleSaveName = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === userDisplayName) return;
    const ok = await updateDisplayName(trimmedName);
    if (ok) {
      Alert.alert(t('settings.name_saved'));
    }
  }, [name, userDisplayName, updateDisplayName, t]);

  const nameChanged = name.trim() !== userDisplayName;

  return (
    <>
      <SectionHeader title={t('settings.profile')} />
      <SectionCard>
        <SectionRow
          icon={<User size={18} color={colors.textSecondary} strokeWidth={1.5} />}
          label={t('settings.email')}
          value={userEmail}
          isLast={false}
        />
        <View className="px-4 py-3.5 gap-3">
          <Input
            label={t('settings.display_name')}
            value={name}
            onChangeText={setName}
            placeholder={t('settings.display_name_placeholder')}
            autoCapitalize="words"
            accessibilityLabel={t('settings.display_name')}
          />
          {nameChanged && (
            <Button onPress={handleSaveName} loading={isLoading} variant="primary">
              {t('settings.save_name')}
            </Button>
          )}
          {isSuccess && (
            <Text className="text-success text-xs text-center">{t('settings.name_saved')}</Text>
          )}
        </View>
      </SectionCard>
    </>
  );
}

function AppearanceSection() {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <>
      <SectionHeader title={t('settings.appearance')} />
      <SectionCard>
        <View className="px-4 py-3.5 gap-2">
          <View className="flex-row items-center gap-3 mb-1">
            <Palette size={18} color={colors.textSecondary} strokeWidth={1.5} />
            <Text className="text-text-primary text-base">{t('settings.theme')}</Text>
          </View>
          <ThemeToggle />
        </View>
      </SectionCard>
    </>
  );
}

function LanguageSection() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useSettings();

  return (
    <>
      <SectionHeader title={t('settings.language')} />
      <SectionCard>
        <LanguageOption
          label={t('settings.language_en')}
          isSelected={currentLanguage === 'en'}
          onPress={() => changeLanguage('en')}
        />
        <LanguageOption
          label={t('settings.language_es')}
          isSelected={currentLanguage === 'es'}
          onPress={() => changeLanguage('es')}
          isLast
        />
      </SectionCard>
    </>
  );
}

function NotificationsSection() {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <>
      <SectionHeader title={t('settings.notifications')} />
      <SectionCard>
        <SectionRow
          icon={<Bell size={18} color={colors.textSecondary} strokeWidth={1.5} />}
          label={t('settings.push_notifications')}
          value={t('settings.notifications_coming_soon')}
          isLast
        />
      </SectionCard>
    </>
  );
}

function AboutSection() {
  const { t } = useTranslation();
  const colors = useColors();
  const appVersion = Constants.expoConfig?.version ?? '0.0.0';

  const handleOpenWebsite = useCallback(() => {
    Linking.openURL('https://alvarotc.com');
  }, []);

  return (
    <>
      <SectionHeader title={t('settings.about')} />
      <SectionCard>
        <SectionRow
          icon={<Info size={18} color={colors.textSecondary} strokeWidth={1.5} />}
          label={t('settings.version')}
          value={appVersion}
        />
        <Pressable
          onPress={handleOpenWebsite}
          accessibilityRole="link"
          accessibilityLabel={t('settings.made_with')}
          className="flex-row items-center gap-3 px-4 py-3.5 border-b border-border-subtle"
        >
          {({ pressed }) => (
            <View
              className="flex-row items-center gap-2 flex-1"
              style={{ opacity: pressed ? 0.7 : 1 }}
            >
              <Text className="text-brand-terracota text-sm flex-1">
                {t('settings.made_with')}
              </Text>
              <ExternalLink size={14} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
          )}
        </Pressable>
        <SectionRow
          icon={<Globe size={18} color={colors.textSecondary} strokeWidth={1.5} />}
          label={t('settings.license')}
          isLast
        />
      </SectionCard>
    </>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-4 pb-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          {({ pressed }) => (
            <ArrowLeft
              size={22}
              color={colors.textPrimary}
              strokeWidth={1.5}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text className="text-text-primary font-bold text-xl flex-1">{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <ProfileSection />
        <AppearanceSection />
        <LanguageSection />
        <NotificationsSection />
        <AboutSection />
      </ScrollView>
    </View>
  );
}

import { View, Text, Pressable } from 'react-native';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from '@/store/themeStore';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeModeOption {
  value: ThemeMode;
  labelKey: string;
  Icon: typeof Sun;
}

const OPTIONS: ThemeModeOption[] = [
  { value: 'system', labelKey: 'settings.theme_system', Icon: Smartphone },
  { value: 'light', labelKey: 'settings.theme_light', Icon: Sun },
  { value: 'dark', labelKey: 'settings.theme_dark', Icon: Moon },
];

export function ThemeToggle() {
  const { t } = useTranslation();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const { colorScheme } = useColorScheme();

  const iconColor = colorScheme === 'dark' ? '#A3A3A3' : '#525252';
  const activeIconColor = colorScheme === 'dark' ? '#EDEDED' : '#171717';

  return (
    <View
      className="flex-row rounded-xl bg-neutral-100 dark:bg-bg-tertiary p-1"
      accessibilityRole="radiogroup"
      accessibilityLabel={t('settings.theme')}
    >
      {OPTIONS.map((option) => {
        const isActive = mode === option.value;
        const { Icon } = option;

        return (
          <Pressable
            key={option.value}
            onPress={() => setMode(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t(option.labelKey)}
            className="flex-1"
          >
            {({ pressed }) => (
              <View
                className={`flex-row items-center justify-center gap-1.5 py-2 rounded-lg ${
                  isActive
                    ? 'bg-white dark:bg-bg-elevated shadow-sm'
                    : ''
                }`}
                style={{ opacity: pressed ? 0.7 : 1 }}
              >
                <Icon
                  size={16}
                  color={isActive ? activeIconColor : iconColor}
                  strokeWidth={1.5}
                />
                <Text
                  className={`text-xs font-medium ${
                    isActive
                      ? 'text-neutral-900 dark:text-text-primary'
                      : 'text-neutral-500 dark:text-text-tertiary'
                  }`}
                >
                  {t(option.labelKey)}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

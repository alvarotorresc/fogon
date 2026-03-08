import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useErrorStore } from '@/store/errorStore';
import { useColors } from '@/constants/useColors';

const AUTO_DISMISS_MS = 4000;

export function ErrorToast() {
  const { toast, dismiss } = useErrorStore();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast?.id]);

  if (!toast) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        right: 16,
        opacity,
        zIndex: 9999,
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View
        style={{
          backgroundColor: colors.error,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Text
          style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500', flex: 1 }}
          numberOfLines={2}
        >
          {toast.message}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {toast.retryAction ? (
            <Pressable
              onPress={() => {
                dismiss();
                toast.retryAction?.();
              }}
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
            >
              {({ pressed }) => (
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '700',
                    textDecorationLine: 'underline',
                    opacity: pressed ? 0.7 : 1,
                  }}
                >
                  {t('common.retry')}
                </Text>
              )}
            </Pressable>
          ) : null}

          <Pressable
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={8}
          >
            {({ pressed }) => (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: '700',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                x
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

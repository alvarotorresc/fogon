import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/constants/useColors';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-6 opacity-40">
        <Icon size={56} color={colors.terracota} strokeWidth={1.5} />
      </View>

      <Text className="text-text-primary font-semibold text-lg text-center mb-2">
        {title}
      </Text>

      <Text className="text-text-secondary text-sm text-center mb-8 leading-5">
        {description}
      </Text>

      <Pressable
        onPress={onAction}
        className="bg-brand-blue rounded-xl px-6 py-3"
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        {({ pressed }) => (
          <Text
            className="text-white font-semibold text-base"
            style={{ opacity: pressed ? 0.7 : 1 }}
          >
            {actionLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

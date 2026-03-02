import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import type { ShoppingItem as ShoppingItemType } from '@fogon/types';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggle: (id: string, isDone: boolean) => void;
}

export function ShoppingItem({ item, onToggle }: ShoppingItemProps) {
  const { t } = useTranslation();

  return (
    <Pressable onPress={() => onToggle(item.id, !item.isDone)}>
      {({ pressed }) => (
        <View
          className={`flex-row items-center px-4 py-3 ${pressed ? 'opacity-70' : ''} ${item.isDone ? 'opacity-50' : ''}`}
        >
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${item.isDone ? 'bg-brand-terracota border-brand-terracota' : 'border-text-tertiary'}`}
          >
            {item.isDone && <Check size={14} color={COLORS.textPrimary} strokeWidth={3} />}
          </View>

          <View className="flex-1">
            <Text
              className={`text-base ${item.isDone ? 'text-text-tertiary line-through' : 'text-text-primary'}`}
            >
              {item.name}
            </Text>
            <Text className="text-text-tertiary text-xs mt-0.5">
              {item.addedByName}
              {item.isDone && item.doneByName
                ? ` — ${t('shopping.done_by', { name: item.doneByName })}`
                : ''}
            </Text>
          </View>

          {item.quantity && (
            <View className="bg-bg-tertiary rounded-md px-2 py-1 ml-2">
              <Text className="text-text-secondary text-xs">{item.quantity}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

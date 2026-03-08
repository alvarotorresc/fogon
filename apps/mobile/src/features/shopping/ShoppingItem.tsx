import { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Check, Trash2, Pencil } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import type { ShoppingItem as ShoppingItemType } from '@fogon/types';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ShoppingItemType) => void;
}

function RightActions(
  _progress: Animated.AnimatedInterpolation<number>,
  onEdit: () => void,
  onDelete: () => void,
) {
  return (
    <View className="flex-row">
      <Pressable onPress={onEdit}>
        {({ pressed }) => (
          <View
            className="bg-brand-blue justify-center items-center w-16"
            style={{ opacity: pressed ? 0.7 : 1 }}
          >
            <Pencil size={20} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        )}
      </Pressable>
      <Pressable onPress={onDelete}>
        {({ pressed }) => (
          <View
            className="bg-error justify-center items-center w-16"
            style={{ opacity: pressed ? 0.7 : 1 }}
          >
            <Trash2 size={20} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

export function ShoppingItem({ item, onToggle, onDelete, onEdit }: ShoppingItemProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete(item.id);
  };

  const handleEdit = () => {
    swipeableRef.current?.close();
    onEdit(item);
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={(progress) => RightActions(progress, handleEdit, handleDelete)}
      overshootRight={false}
    >
      <Pressable onPress={() => onToggle(item.id, !item.isDone)}>
        {({ pressed }) => (
          <View
            className={`flex-row items-center px-4 py-3 bg-bg-primary ${pressed ? 'opacity-70' : ''} ${item.isDone ? 'opacity-50' : ''}`}
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
    </Swipeable>
  );
}

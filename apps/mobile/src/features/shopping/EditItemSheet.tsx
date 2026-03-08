import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/constants/colors';
import type { ShoppingItem } from '@fogon/types';

interface EditItemSheetProps {
  visible: boolean;
  item: ShoppingItem | null;
  onClose: () => void;
  onSave: (data: { id: string; name: string; quantity?: string }) => void;
  loading?: boolean;
}

export function EditItemSheet({ visible, item, onClose, onSave, loading }: EditItemSheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity ?? '');
    }
  }, [item]);

  const handleSave = () => {
    if (!name.trim() || !item) return;
    onSave({ id: item.id, name: name.trim(), quantity: quantity.trim() || undefined });
  };

  const handleClose = () => {
    setName('');
    setQuantity('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <Pressable className="flex-1" onPress={handleClose}>
          {() => <View className="flex-1" />}
        </Pressable>

        <View className="bg-bg-secondary rounded-t-2xl border-t border-border px-5 pb-8 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-text-primary text-lg font-bold">{t('common.edit')}</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              {({ pressed }) => (
                <X size={24} color={COLORS.textSecondary} opacity={pressed ? 0.5 : 1} />
              )}
            </Pressable>
          </View>

          <View className="gap-4">
            <Input
              label={t('shopping.add_item')}
              value={name}
              onChangeText={setName}
              placeholder="..."
              autoFocus
            />

            <Input
              label={t('recipes.quantity_placeholder')}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1kg, 2L, 6 units..."
            />

            <Button onPress={handleSave} disabled={!name.trim()} loading={loading}>
              {t('common.save')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

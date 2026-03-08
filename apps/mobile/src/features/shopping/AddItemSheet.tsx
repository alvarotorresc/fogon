import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SHOPPING_CATEGORIES } from '@/constants/categories';
import { useColors } from '@/constants/useColors';

interface AddItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; quantity?: string; category: string }) => void;
  loading?: boolean;
}

export function AddItemSheet({ visible, onClose, onAdd, loading }: AddItemSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<string>(SHOPPING_CATEGORIES[0].key);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity: quantity.trim() || undefined, category });
    setName('');
    setQuantity('');
    setCategory(SHOPPING_CATEGORIES[0].key);
  };

  const handleClose = () => {
    setName('');
    setQuantity('');
    setCategory(SHOPPING_CATEGORIES[0].key);
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
            <Text className="text-text-primary text-lg font-bold">{t('shopping.add_item')}</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              {({ pressed }) => (
                <X size={24} color={colors.textSecondary} opacity={pressed ? 0.5 : 1} />
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

            <Input label={t('common.edit')} value={quantity} onChangeText={setQuantity} placeholder="1kg, 2L, 6 units..." />

            <View className="gap-1.5">
              <Text className="text-text-secondary text-sm font-medium">
                {t('shopping.categories.otros')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                <View className="flex-row gap-2">
                  {SHOPPING_CATEGORIES.map((cat) => (
                    <Pressable key={cat.key} onPress={() => setCategory(cat.key)}>
                      {({ pressed }) => (
                        <View
                          className={`px-3 py-2 rounded-lg border ${
                            category === cat.key
                              ? 'bg-brand-terracota-faint border-brand-terracota'
                              : 'bg-bg-tertiary border-border'
                          } ${pressed ? 'opacity-70' : ''}`}
                        >
                          <Text
                            className={`text-sm ${category === cat.key ? 'text-brand-terracota' : 'text-text-secondary'}`}
                          >
                            {cat.icon} {t(`shopping.categories.${cat.key}`)}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Button onPress={handleAdd} disabled={!name.trim()} loading={loading}>
              {t('shopping.add_item')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

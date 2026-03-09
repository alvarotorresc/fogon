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
import type { StockLevel } from '@fogon/types';

interface AddPantryItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; quantity?: string; category: string; stockLevel: StockLevel }) => void;
  loading?: boolean;
}

const STOCK_OPTIONS: { value: StockLevel; colorClass: string }[] = [
  { value: 'ok', colorClass: 'text-success' },
  { value: 'low', colorClass: 'text-warning' },
  { value: 'empty', colorClass: 'text-error' },
];

export function AddPantryItemSheet({ visible, onClose, onAdd, loading }: AddPantryItemSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<string>(SHOPPING_CATEGORIES[0].key);
  const [stockLevel, setStockLevel] = useState<StockLevel>('ok');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      category,
      stockLevel,
    });
    setName('');
    setQuantity('');
    setCategory(SHOPPING_CATEGORIES[0].key);
    setStockLevel('ok');
  };

  const handleClose = () => {
    setName('');
    setQuantity('');
    setCategory(SHOPPING_CATEGORIES[0].key);
    setStockLevel('ok');
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
            <Text className="text-text-primary text-lg font-bold">{t('pantry.add_item')}</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              {({ pressed }) => (
                <X size={24} color={colors.textSecondary} opacity={pressed ? 0.5 : 1} />
              )}
            </Pressable>
          </View>

          <View className="gap-4">
            <Input
              label={t('pantry.add_item')}
              value={name}
              onChangeText={setName}
              placeholder="..."
              autoFocus
            />

            <Input
              label={t('common.edit')}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1kg, 2L, 6 units..."
            />

            <View className="gap-1.5">
              <Text className="text-text-secondary text-sm font-medium">
                {t('shopping.categories.otros')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

            <View className="gap-1.5">
              <Text className="text-text-secondary text-sm font-medium">Stock</Text>
              <View className="flex-row gap-2">
                {STOCK_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setStockLevel(opt.value)}
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={`py-2 rounded-lg border items-center ${
                          stockLevel === opt.value
                            ? 'bg-brand-terracota-faint border-brand-terracota'
                            : 'bg-bg-tertiary border-border'
                        } ${pressed ? 'opacity-70' : ''}`}
                      >
                        <Text
                          className={`text-sm font-semibold ${stockLevel === opt.value ? 'text-brand-terracota' : opt.colorClass}`}
                        >
                          {t(`pantry.stock.${opt.value}`)}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <Button onPress={handleAdd} disabled={!name.trim()} loading={loading}>
              {t('pantry.add_item')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

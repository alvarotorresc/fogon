import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Package } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/constants/useColors';
import { usePantry, useAddPantryItem, useUpdateStockLevel } from '@/features/pantry/usePantry';
import { PantryItem } from '@/features/pantry/PantryItem';
import { AddPantryItemSheet } from '@/features/pantry/AddPantryItemSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import type { PantryItem as PantryItemType } from '@fogon/types';
import type { StockLevel } from '@fogon/types';

type FilterValue = 'all' | StockLevel;

const FILTERS: FilterValue[] = ['all', 'ok', 'low', 'empty'];

export default function PantryScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { data: items, isLoading, isError, refetch } = usePantry();
  const addItem = useAddPantryItem();
  const updateStock = useUpdateStockLevel();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [shoppingFeedback, setShoppingFeedback] = useState(false);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout>>();

  const showShoppingFeedback = useCallback(() => {
    setShoppingFeedback(true);
    feedbackOpacity.setValue(1);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => {
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShoppingFeedback(false));
    }, 2000);
  }, [feedbackOpacity]);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const filteredItems = useMemo<PantryItemType[]>(() => {
    if (!items) return [];
    if (filter === 'all') return items;
    return items.filter((item) => item.stockLevel === filter);
  }, [items, filter]);

  const handleCycleStock = (id: string, nextLevel: StockLevel) => {
    updateStock.mutate(
      { id, stockLevel: nextLevel },
      {
        onSuccess: (result) => {
          if (result.addedToShoppingList) {
            showShoppingFeedback();
          }
        },
      },
    );
  };

  const handleAdd = (data: {
    name: string;
    quantity?: string;
    category: string;
    stockLevel: StockLevel;
  }) => {
    addItem.mutate(data, {
      onSuccess: () => setSheetVisible(false),
    });
  };

  const getFilterLabel = (f: FilterValue): string => {
    if (f === 'all') return 'All';
    return t(`pantry.stock.${f}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center">
        <ActivityIndicator color={colors.terracota} size="large" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center px-5">
        <Text className="text-text-secondary text-base mb-4">{t('common.error')}</Text>
        <Pressable onPress={() => refetch()}>
          {({ pressed }) => (
            <Text className={`text-brand-blue text-base font-semibold ${pressed ? 'opacity-70' : ''}`}>
              {t('common.retry')}
            </Text>
          )}
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-5 pt-2 pb-3">
        <Text className="text-text-primary text-2xl font-bold mb-3">{t('pantry.title')}</Text>

        <View className="flex-row gap-2">
          {FILTERS.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)}>
              {({ pressed }) => (
                <View
                  className={`px-3 py-1.5 rounded-full ${
                    filter === f
                      ? 'bg-brand-terracota'
                      : 'bg-bg-tertiary'
                  } ${pressed ? 'opacity-70' : ''}`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      filter === f ? 'text-white' : 'text-text-secondary'
                    }`}
                  >
                    {getFilterLabel(f)}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {shoppingFeedback && (
        <Animated.View
          style={{ opacity: feedbackOpacity }}
          className="mx-5 mb-2 px-3 py-2 bg-success-bg rounded-lg flex-row items-center"
        >
          <Text className="text-success text-sm font-medium">
            {t('pantry.added_to_shopping')}
          </Text>
        </Animated.View>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('pantry.empty_title')}
          description={t('pantry.empty_description')}
          actionLabel={t('pantry.add_item')}
          onAction={() => setSheetVisible(true)}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <PantryItem item={item} onCycleStock={handleCycleStock} />
          )}
          contentContainerClassName="px-3 pb-24"
        />
      )}

      <Pressable
        onPress={() => setSheetVisible(true)}
        className="absolute bottom-24 right-5"
      >
        {({ pressed }) => (
          <View
            className={`w-14 h-14 rounded-full bg-brand-terracota items-center justify-center shadow-lg ${pressed ? 'opacity-80' : ''}`}
          >
            <Plus size={28} color={colors.textPrimary} strokeWidth={2.5} />
          </View>
        )}
      </Pressable>

      <AddPantryItemSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onAdd={handleAdd}
        loading={addItem.isPending}
      />
    </SafeAreaView>
  );
}

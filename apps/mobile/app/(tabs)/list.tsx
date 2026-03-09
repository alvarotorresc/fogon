import { useMemo, useState } from 'react';
import { View, Text, SectionList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/constants/useColors';
import { SHOPPING_CATEGORIES } from '@/constants/categories';
import {
  useShoppingList,
  useAddShoppingItem,
  useToggleShoppingItem,
  useClearDoneItems,
  useDeleteShoppingItem,
  useUpdateShoppingItem,
} from '@/features/shopping/useShoppingList';
import { ShoppingItem } from '@/features/shopping/ShoppingItem';
import { AddItemSheet } from '@/features/shopping/AddItemSheet';
import { EditItemSheet } from '@/features/shopping/EditItemSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ShoppingItem as ShoppingItemType } from '@fogon/types';

interface Section {
  title: string;
  icon: string;
  data: ShoppingItemType[];
}

export default function ListScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { data: items, isLoading, isError, refetch } = useShoppingList();
  const addItem = useAddShoppingItem();
  const toggleItem = useToggleShoppingItem();
  const clearDone = useClearDoneItems();
  const deleteItem = useDeleteShoppingItem();
  const updateItem = useUpdateShoppingItem();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItemType | null>(null);

  const sections = useMemo<Section[]>(() => {
    if (!items?.length) return [];
    return SHOPPING_CATEGORIES.map((cat) => ({
      title: t(`shopping.categories.${cat.key}`),
      icon: cat.icon,
      data: items.filter((item) => item.category === cat.key),
    })).filter((section) => section.data.length > 0);
  }, [items, t]);

  const doneCount = items?.filter((i) => i.isDone).length ?? 0;
  const totalCount = items?.length ?? 0;
  const progress = totalCount > 0 ? doneCount / totalCount : 0;

  const handleToggle = (id: string, isDone: boolean) => {
    toggleItem.mutate({ id, isDone });
  };

  const handleAdd = (data: { name: string; quantity?: string; category: string }) => {
    addItem.mutate(data, {
      onSuccess: () => setSheetVisible(false),
    });
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id);
  };

  const handleEdit = (item: ShoppingItemType) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (data: { id: string; name: string; quantity?: string }) => {
    updateItem.mutate(data, {
      onSuccess: () => setEditingItem(null),
    });
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
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-text-primary text-2xl font-bold">{t('shopping.title')}</Text>
            <View className="w-2 h-2 rounded-full bg-success mt-1" />
          </View>

          {doneCount > 0 && (
            <Pressable onPress={() => clearDone.mutate()} disabled={clearDone.isPending}>
              {({ pressed }) => (
                <View className={`flex-row items-center gap-1.5 ${pressed ? 'opacity-70' : ''}`}>
                  <Trash2 size={14} color={colors.textTertiary} />
                  <Text className="text-text-tertiary text-sm">{t('shopping.clear_done')}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {totalCount > 0 && (
          <View className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <View
              className="h-full bg-brand-terracota rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        )}
      </View>

      {totalCount === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={t('shopping.empty_title')}
          description={t('shopping.empty_description')}
          actionLabel={t('shopping.add_item')}
          onAction={() => setSheetVisible(true)}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View className="bg-bg-primary px-5 py-2 flex-row items-center gap-2">
              <Text className="text-base">{section.icon}</Text>
              <Text className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                {section.title}
              </Text>
              <Text className="text-text-tertiary text-xs">({section.data.length})</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ShoppingItem item={item} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
          )}
          stickySectionHeadersEnabled
          contentContainerClassName="pb-24"
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

      <AddItemSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onAdd={handleAdd}
        loading={addItem.isPending}
      />

      <EditItemSheet
        visible={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        loading={updateItem.isPending}
      />
    </SafeAreaView>
  );
}

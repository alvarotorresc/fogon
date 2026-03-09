import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/constants/useColors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMealPlan, useAssignMeal, useClearMealSlot } from '@/features/meal-plan/useMealPlan';
import { useRecipes } from '@/features/recipes/useRecipes';
import type { MealPlanEntry, MealSlot, Recipe } from '@fogon/types';

interface SlotSelection {
  dayOfWeek: number;
  slot: MealSlot;
}

function MealSlotCell({
  entry,
  dayOfWeek,
  slot,
  onTap,
  onClear,
}: {
  entry: MealPlanEntry | undefined;
  dayOfWeek: number;
  slot: MealSlot;
  onTap: (selection: SlotSelection) => void;
  onClear: (id: string) => void;
}) {
  const { t } = useTranslation();
  const label = entry?.recipe?.title ?? entry?.customText;

  return (
    <Pressable
      onPress={() => onTap({ dayOfWeek, slot })}
      onLongPress={() => entry && onClear(entry.id)}
      className="flex-1 bg-bg-tertiary rounded-lg p-2 min-h-[44px] justify-center"
      accessibilityLabel={`${t(`days.${dayOfWeek}`)} ${t(`menu.${slot}`)}`}
      accessibilityRole="button"
    >
      {({ pressed }) => (
        <Text
          className={`text-xs ${label ? 'text-text-primary' : 'text-text-tertiary'}`}
          style={{ opacity: pressed ? 0.7 : 1 }}
          numberOfLines={2}
        >
          {label ?? t('menu.empty_slot')}
        </Text>
      )}
    </Pressable>
  );
}

function AssignModal({
  visible,
  selection,
  recipes,
  weekOffset,
  onClose,
  onAssignRecipe,
  onAssignCustom,
}: {
  visible: boolean;
  selection: SlotSelection | null;
  recipes: Recipe[];
  weekOffset: number;
  onClose: () => void;
  onAssignRecipe: (recipeId: string) => void;
  onAssignCustom: (text: string) => void;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [customText, setCustomText] = useState('');

  const handleCustomSubmit = useCallback(() => {
    if (customText.trim()) {
      onAssignCustom(customText.trim());
      setCustomText('');
    }
  }, [customText, onAssignCustom]);

  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => (
      <Pressable
        onPress={() => onAssignRecipe(item.id)}
        className="flex-row items-center gap-3 p-3 border-b border-border-subtle"
      >
        {({ pressed }) => (
          <View className="flex-1" style={{ opacity: pressed ? 0.7 : 1 }}>
            <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
              {item.title}
            </Text>
            {item.prepTimeMinutes !== null && (
              <Text className="text-text-tertiary text-xs">
                {t('recipes.prep_time', { minutes: item.prepTimeMinutes })}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    ),
    [onAssignRecipe, t],
  );

  if (!selection) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Pressable onPress={onClose} accessibilityLabel={t('common.close')} accessibilityRole="button">
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.7 : 1 }}>
                <X size={20} color={colors.textPrimary} strokeWidth={1.5} />
              </View>
            )}
          </Pressable>
          <Text className="text-text-primary font-semibold text-base">
            {t('menu.assign_recipe')}
          </Text>
          <View className="w-6" />
        </View>

        {/* Custom text input */}
        <View className="px-4 py-3 border-b border-border gap-2">
          <Text className="text-text-secondary text-sm font-medium">{t('menu.or_custom')}</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                value={customText}
                onChangeText={setCustomText}
                placeholder={t('menu.custom_text_placeholder')}
                accessibilityLabel={t('menu.custom_text_placeholder')}
              />
            </View>
            <Button
              onPress={handleCustomSubmit}
              disabled={!customText.trim()}
              variant="secondary"
            >
              {t('common.save')}
            </Button>
          </View>
        </View>

        {/* Recipe list */}
        <View className="px-4 py-2">
          <Text className="text-text-secondary text-sm font-medium">
            {t('menu.select_recipe')}
          </Text>
        </View>
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-text-tertiary text-sm">{t('recipes.empty')}</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

export default function MealPlanScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selection, setSelection] = useState<SlotSelection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: entries, isLoading, error, refetch } = useMealPlan(weekOffset);
  const { data: recipes } = useRecipes();
  const assignMeal = useAssignMeal();
  const clearSlot = useClearMealSlot();

  const days = useMemo(() => [0, 1, 2, 3, 4, 5, 6], []);

  const getEntry = useCallback(
    (dayOfWeek: number, slot: MealSlot): MealPlanEntry | undefined => {
      return entries?.find((e) => e.dayOfWeek === dayOfWeek && e.slot === slot);
    },
    [entries],
  );

  const handleSlotTap = useCallback((sel: SlotSelection) => {
    setSelection(sel);
    setModalVisible(true);
  }, []);

  const handleClearSlot = useCallback(
    (id: string) => {
      Alert.alert(t('menu.clear_slot'), '', [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => clearSlot.mutate(id),
        },
      ]);
    },
    [clearSlot, t],
  );

  const handleAssignRecipe = useCallback(
    (recipeId: string) => {
      if (!selection) return;
      assignMeal.mutate({
        dayOfWeek: selection.dayOfWeek,
        slot: selection.slot,
        recipeId,
        weekOffset,
      });
      setModalVisible(false);
      setSelection(null);
    },
    [selection, assignMeal, weekOffset],
  );

  const handleAssignCustom = useCallback(
    (text: string) => {
      if (!selection) return;
      assignMeal.mutate({
        dayOfWeek: selection.dayOfWeek,
        slot: selection.slot,
        customText: text,
        weekOffset,
      });
      setModalVisible(false);
      setSelection(null);
    },
    [selection, assignMeal, weekOffset],
  );

  return (
    <View className="flex-1 bg-bg-primary">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b border-border"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.7 : 1 }}>
              <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </View>
          )}
        </Pressable>
        <Text className="text-text-primary font-semibold text-lg">{t('menu.title')}</Text>
        <View className="w-10" />
      </View>

      {/* Week navigation */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => setWeekOffset((prev) => prev - 1)}
          className="w-10 h-10 items-center justify-center rounded-lg bg-bg-tertiary"
          accessibilityLabel={t('menu.prev_week')}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.7 : 1 }}>
              <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </View>
          )}
        </Pressable>

        <Text className="text-text-primary font-medium text-sm">
          {weekOffset === 0
            ? t('menu.title')
            : weekOffset > 0
              ? `+${weekOffset}`
              : `${weekOffset}`}
        </Text>

        <Pressable
          onPress={() => setWeekOffset((prev) => prev + 1)}
          className="w-10 h-10 items-center justify-center rounded-lg bg-bg-tertiary"
          accessibilityLabel={t('menu.next_week')}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.7 : 1 }}>
              <ChevronRight size={20} color={colors.textPrimary} strokeWidth={1.5} />
            </View>
          )}
        </Pressable>
      </View>

      {/* Table header */}
      <View className="flex-row px-4 pb-2 gap-2">
        <View className="w-12" />
        <View className="flex-1 items-center">
          <Text className="text-text-tertiary text-xs font-medium">{t('menu.lunch')}</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-text-tertiary text-xs font-medium">{t('menu.dinner')}</Text>
        </View>
      </View>

      {/* Week grid */}
      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator color={colors.terracota} />
        </View>
      ) : error ? (
        <View className="items-center py-12 gap-3">
          <Text className="text-error text-sm">{t('common.error')}</Text>
          <Pressable onPress={() => refetch()}>
            {({ pressed }) => (
              <Text
                className="text-brand-blue text-sm font-medium"
                style={{ opacity: pressed ? 0.7 : 1 }}
              >
                {t('common.retry')}
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 6 }}
        >
          {days.map((dayOfWeek) => {
            const today = new Date().getDay();
            const currentDayOfWeek = today === 0 ? 6 : today - 1;
            const isToday = weekOffset === 0 && dayOfWeek === currentDayOfWeek;

            return (
              <View
                key={dayOfWeek}
                className={`flex-row gap-2 items-center py-2 px-2 rounded-xl ${
                  isToday ? 'bg-brand-terracota-faint border border-brand-terracota/30' : ''
                }`}
              >
                <View className="w-12">
                  <Text
                    className={`text-xs font-medium ${
                      isToday ? 'text-brand-terracota' : 'text-text-secondary'
                    }`}
                  >
                    {t(`days.short_${dayOfWeek}`)}
                  </Text>
                </View>
                <MealSlotCell
                  entry={getEntry(dayOfWeek, 'lunch')}
                  dayOfWeek={dayOfWeek}
                  slot="lunch"
                  onTap={handleSlotTap}
                  onClear={handleClearSlot}
                />
                <MealSlotCell
                  entry={getEntry(dayOfWeek, 'dinner')}
                  dayOfWeek={dayOfWeek}
                  slot="dinner"
                  onTap={handleSlotTap}
                  onClear={handleClearSlot}
                />
              </View>
            );
          })}
        </ScrollView>
      )}

      <AssignModal
        visible={modalVisible}
        selection={selection}
        recipes={recipes ?? []}
        weekOffset={weekOffset}
        onClose={() => {
          setModalVisible(false);
          setSelection(null);
        }}
        onAssignRecipe={handleAssignRecipe}
        onAssignCustom={handleAssignCustom}
      />
    </View>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, ChefHat, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/constants/useColors';
import { useRecipes } from '@/features/recipes/useRecipes';
import { useMealPlan } from '@/features/meal-plan/useMealPlan';
import { RecipeCard } from '@/features/recipes/RecipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/lib/useDebounce';
import type { Recipe, MealPlanEntry } from '@fogon/types';

type FilterOption = 'all' | 'curated' | 'mine';

function TodayPlanSection({ entries }: { entries: MealPlanEntry[] }) {
  const { t } = useTranslation();
  const today = new Date().getDay();
  const dayOfWeek = today === 0 ? 6 : today - 1;

  const todayEntries = entries.filter((e) => e.dayOfWeek === dayOfWeek);
  const lunch = todayEntries.find((e) => e.slot === 'lunch');
  const dinner = todayEntries.find((e) => e.slot === 'dinner');

  return (
    <View className="bg-bg-secondary rounded-xl border border-border p-4 mb-4">
      <Text className="text-text-primary font-semibold text-base mb-3">
        {t('menu.today_plan')}
      </Text>

      <View className="gap-2">
        <View className="flex-row items-center gap-3">
          <View className="w-16">
            <Text className="text-text-secondary text-sm">{t('menu.lunch')}</Text>
          </View>
          <Text className="text-text-primary text-sm flex-1" numberOfLines={1}>
            {lunch?.recipe?.title ?? lunch?.customText ?? t('menu.no_plan')}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-16">
            <Text className="text-text-secondary text-sm">{t('menu.dinner')}</Text>
          </View>
          <Text className="text-text-primary text-sm flex-1" numberOfLines={1}>
            {dinner?.recipe?.title ?? dinner?.customText ?? t('menu.no_plan')}
          </Text>
        </View>
      </View>
    </View>
  );
}

function FilterChips({
  selected,
  onSelect,
}: {
  selected: FilterOption;
  onSelect: (option: FilterOption) => void;
}) {
  const { t } = useTranslation();
  const options: Array<{ key: FilterOption; label: string }> = [
    { key: 'all', label: t('recipes.all') },
    { key: 'curated', label: t('recipes.fogon_collection') },
    { key: 'mine', label: t('recipes.my_recipes') },
  ];

  return (
    <View className="flex-row gap-2 mb-4">
      {options.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onSelect(opt.key)}
          className={`rounded-full px-4 py-2 border ${
            selected === opt.key
              ? 'bg-brand-terracota border-brand-terracota'
              : 'bg-bg-tertiary border-border'
          }`}
        >
          {({ pressed }) => (
            <Text
              className={`text-sm font-medium ${
                selected === opt.key ? 'text-white' : 'text-text-secondary'
              }`}
              style={{ opacity: pressed ? 0.7 : 1 }}
            >
              {opt.label}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function RecipeSearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <View className="flex-row items-center bg-bg-tertiary rounded-lg px-3 py-2.5 mb-3 gap-2">
      <Search size={18} color={colors.textTertiary} strokeWidth={1.5} />
      <TextInput
        className="flex-1 text-text-primary text-sm p-0"
        placeholder={t('recipes.search_placeholder')}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={t('recipes.search_placeholder')}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} accessibilityLabel={t('common.close')} accessibilityRole="button">
          {({ pressed }) => (
            <X
              size={16}
              color={colors.textTertiary}
              strokeWidth={1.5}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      )}
    </View>
  );
}

export default function MenuScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: recipes, isLoading: recipesLoading, error: recipesError, refetch: refetchRecipes } = useRecipes();
  const { data: mealPlan } = useMealPlan();

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    let result = recipes;

    switch (filter) {
      case 'curated':
        result = result.filter((r) => r.isCurated);
        break;
      case 'mine':
        result = result.filter((r) => !r.isCurated);
        break;
    }

    const query = debouncedSearch.trim().toLowerCase();
    if (query) {
      result = result.filter((r) => r.title.toLowerCase().includes(query));
    }

    return result;
  }, [recipes, filter, debouncedSearch]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipes/${recipe.id}`);
    },
    [router],
  );

  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
    ),
    [handleRecipePress],
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  return (
    <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text-primary font-bold text-2xl">{t('recipes.title')}</Text>
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipe}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        ListHeaderComponent={
          <View>
            {mealPlan && mealPlan.length > 0 && <TodayPlanSection entries={mealPlan} />}
            <RecipeSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
            <FilterChips selected={filter} onSelect={setFilter} />
          </View>
        }
        ListEmptyComponent={
          recipesLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.terracota} />
            </View>
          ) : recipesError ? (
            <View className="items-center py-12 gap-3">
              <Text className="text-error text-sm">{t('common.error')}</Text>
              <Pressable onPress={() => refetchRecipes()}>
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
          ) : debouncedSearch.trim() ? (
            <View className="items-center py-12 gap-3">
              <Search size={48} color={colors.textTertiary} strokeWidth={1.5} />
              <Text className="text-text-tertiary text-sm">{t('recipes.search_no_results')}</Text>
            </View>
          ) : (
            <EmptyState
              icon={ChefHat}
              title={t('recipes.empty_title')}
              description={t('recipes.empty_description')}
              actionLabel={t('recipes.add_recipe')}
              onAction={() => router.push('/recipes/create')}
            />
          )
        }
      />

      <Pressable
        onPress={() => router.push('/recipes/create')}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-brand-terracota items-center justify-center"
        style={{ marginBottom: insets.bottom }}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            <Plus size={24} color="white" strokeWidth={2} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

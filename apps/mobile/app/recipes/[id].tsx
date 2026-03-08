import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ArrowLeft, Clock, Share2, ShoppingCart, Pencil, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useRecipes, useAddRecipeToShopping, useDeleteRecipe } from '@/features/recipes/useRecipes';
import { formatRecipeForSharing } from '@/features/recipes/formatRecipeForSharing';

function PlaceholderHero() {
  return (
    <View className="h-56 w-full bg-brand-terracota-faint items-center justify-center">
      <Text className="text-6xl">🍳</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: recipes, isLoading } = useRecipes();

  const recipe = recipes?.find((r) => r.id === id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center">
        <ActivityIndicator color={COLORS.terracota} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-bg-primary items-center justify-center" style={{ paddingTop: insets.top }}>
        <Text className="text-text-secondary text-sm">{t('common.error')}</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          {({ pressed }) => (
            <Text
              className="text-brand-blue text-sm font-medium"
              style={{ opacity: pressed ? 0.7 : 1 }}
            >
              {t('common.close')}
            </Text>
          )}
        </Pressable>
      </View>
    );
  }

  const addToShopping = useAddRecipeToShopping();
  const deleteRecipe = useDeleteRecipe();
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  const handleAddToShopping = () => {
    if (!recipe) return;
    addToShopping.mutate(recipe.id, {
      onSuccess: (result) => {
        if (result.added === 0) {
          setAddedFeedback(t('recipes.already_in_list'));
        } else {
          setAddedFeedback(
            result.added === 1
              ? t('recipes.added_to_shopping', { count: result.added })
              : t('recipes.added_to_shopping_plural', { count: result.added }),
          );
        }
        setTimeout(() => setAddedFeedback(null), 3000);
      },
      onError: () => {
        Alert.alert(t('common.error'));
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('recipes.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteRecipe.mutate(recipe.id, {
              onSuccess: () => router.back(),
              onError: () => Alert.alert(t('common.error')),
            });
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push(`/recipes/edit?id=${recipe.id}`);
  };

  const handleShare = async () => {
    const message = formatRecipeForSharing(recipe);
    try {
      await Share.share({ message, title: recipe.title });
    } catch {
      // User cancelled or share failed — no action needed
    }
  };

  return (
    <View className="flex-1 bg-bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={{ height: 224, width: '100%' }}
            contentFit="cover"
          />
        ) : (
          <PlaceholderHero />
        )}

        {/* Back button overlay */}
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 bg-bg-primary/80 rounded-full w-10 h-10 items-center justify-center"
          style={{ top: insets.top + 8 }}
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.7 : 1 }}>
              <ArrowLeft size={20} color={COLORS.textPrimary} strokeWidth={1.5} />
            </View>
          )}
        </Pressable>

        <View className="px-4 pt-4 gap-4">
          {/* Title and badges */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-text-primary font-bold text-2xl">{recipe.title}</Text>
              {recipe.description && (
                <Text className="text-text-secondary text-sm">{recipe.description}</Text>
              )}
            </View>
          </View>

          {/* Metadata */}
          <View className="flex-row items-center gap-4">
            {recipe.prepTimeMinutes !== null && (
              <View className="flex-row items-center gap-1.5">
                <Clock size={16} color={COLORS.textSecondary} strokeWidth={1.5} />
                <Text className="text-text-secondary text-sm">
                  {t('recipes.prep_time', { minutes: recipe.prepTimeMinutes })}
                </Text>
              </View>
            )}
            {recipe.isCurated && (
              <View className="bg-brand-terracota rounded-full px-2.5 py-0.5">
                <Text className="text-white text-xs font-semibold">
                  {t('recipes.curated_badge')}
                </Text>
              </View>
            )}
          </View>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <View className="gap-2">
              <Text className="text-text-primary font-semibold text-lg">
                {t('recipes.ingredients')}
              </Text>
              <View className="bg-bg-secondary rounded-xl border border-border p-3 gap-2">
                {recipe.ingredients.map((ing) => (
                  <View key={ing.id} className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-brand-terracota" />
                    <Text className="text-text-primary text-sm flex-1">
                      {ing.name}
                      {ing.quantity && ` - ${ing.quantity}`}
                      {ing.unit && ` ${ing.unit}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Steps */}
          {recipe.steps.length > 0 && (
            <View className="gap-2">
              <Text className="text-text-primary font-semibold text-lg">
                {t('recipes.steps')}
              </Text>
              <View className="gap-3">
                {recipe.steps.map((step) => (
                  <View
                    key={step.id}
                    className="bg-bg-secondary rounded-xl border border-border p-3 flex-row gap-3"
                  >
                    <View className="w-7 h-7 rounded-full bg-brand-terracota items-center justify-center">
                      <Text className="text-white text-xs font-bold">{step.stepNumber}</Text>
                    </View>
                    <Text className="text-text-primary text-sm flex-1 leading-5">
                      {step.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Add to shopping list button */}
          {recipe.ingredients.length > 0 && (
            <View className="gap-2 mt-2">
              <Pressable
                onPress={handleAddToShopping}
                disabled={addToShopping.isPending}
                className="flex-row items-center justify-center gap-2 h-12 rounded-xl bg-brand-blue"
              >
                {({ pressed }) => (
                  <View
                    className="flex-row items-center gap-2"
                    style={{ opacity: pressed || addToShopping.isPending ? 0.7 : 1 }}
                  >
                    {addToShopping.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <ShoppingCart size={18} color="#FFFFFF" strokeWidth={1.5} />
                    )}
                    <Text className="text-white font-semibold text-base">
                      {t('recipes.add_to_shopping')}
                    </Text>
                  </View>
                )}
              </Pressable>
              {addedFeedback && (
                <Text className="text-text-secondary text-sm text-center">{addedFeedback}</Text>
              )}
            </View>
          )}

          {/* Edit / Delete buttons — only for household recipes */}
          {!recipe.isCurated && (
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={handleEdit}
                className="flex-1 flex-row items-center justify-center gap-2 h-12 rounded-xl bg-bg-elevated border border-border"
              >
                {({ pressed }) => (
                  <View className="flex-row items-center gap-2" style={{ opacity: pressed ? 0.7 : 1 }}>
                    <Pencil size={18} color={COLORS.textPrimary} strokeWidth={1.5} />
                    <Text className="text-text-primary font-semibold text-base">
                      {t('common.edit')}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleDelete}
                disabled={deleteRecipe.isPending}
                className="flex-row items-center justify-center gap-2 h-12 rounded-xl bg-bg-elevated border border-error px-5"
              >
                {({ pressed }) => (
                  <View
                    className="flex-row items-center gap-2"
                    style={{ opacity: pressed || deleteRecipe.isPending ? 0.7 : 1 }}
                  >
                    <Trash2 size={18} color={COLORS.error} strokeWidth={1.5} />
                    <Text className="text-error font-semibold text-base">
                      {t('common.delete')}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          )}

          {/* Share button */}
          <Pressable
            onPress={handleShare}
            className="flex-row items-center justify-center gap-2 h-12 rounded-xl bg-bg-elevated border border-border mt-2"
          >
            {({ pressed }) => (
              <View className="flex-row items-center gap-2" style={{ opacity: pressed ? 0.7 : 1 }}>
                <Share2 size={18} color={COLORS.textPrimary} strokeWidth={1.5} />
                <Text className="text-text-primary font-semibold text-base">
                  {t('recipes.share')}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import type { Recipe } from '@fogon/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

function PlaceholderImage() {
  return (
    <View className="h-32 w-full rounded-t-xl bg-brand-terracota-faint items-center justify-center">
      <Text className="text-4xl">🍳</Text>
    </View>
  );
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable onPress={onPress} className="bg-bg-elevated rounded-xl border border-border mb-3">
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.8 : 1 }}>
          {recipe.imageUrl ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={{ height: 128, width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              contentFit="cover"
            />
          ) : (
            <PlaceholderImage />
          )}

          <View className="p-3 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary font-semibold text-base flex-1" numberOfLines={1}>
                {recipe.title}
              </Text>
              {recipe.isCurated && (
                <View className="bg-brand-terracota rounded-full px-2.5 py-0.5 ml-2">
                  <Text className="text-white text-xs font-semibold">
                    {t('recipes.curated_badge')}
                  </Text>
                </View>
              )}
            </View>

            {recipe.prepTimeMinutes !== null && (
              <View className="flex-row items-center gap-1">
                <Clock size={14} color={COLORS.textSecondary} strokeWidth={1.5} />
                <Text className="text-text-secondary text-xs">
                  {t('recipes.prep_time', { minutes: recipe.prepTimeMinutes })}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

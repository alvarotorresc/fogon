import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, X, GripVertical } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/constants/useColors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateRecipe } from '@/features/recipes/useRecipes';

interface IngredientInput {
  key: string;
  name: string;
  quantity: string;
  unit: string;
}

interface StepInput {
  key: string;
  description: string;
}

function generateKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CreateRecipeScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createRecipe = useCreateRecipe();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { key: generateKey(), name: '', quantity: '', unit: '' },
  ]);
  const [steps, setSteps] = useState<StepInput[]>([
    { key: generateKey(), description: '' },
  ]);

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [...prev, { key: generateKey(), name: '', quantity: '', unit: '' }]);
  }, []);

  const removeIngredient = useCallback((key: string) => {
    setIngredients((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateIngredient = useCallback(
    (key: string, field: keyof Omit<IngredientInput, 'key'>, value: string) => {
      setIngredients((prev) =>
        prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)),
      );
    },
    [],
  );

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { key: generateKey(), description: '' }]);
  }, []);

  const removeStep = useCallback((key: string) => {
    setSteps((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const updateStep = useCallback((key: string, description: string) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, description } : s)));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    const validIngredients = ingredients.filter((i) => i.name.trim());
    const validSteps = steps.filter((s) => s.description.trim());

    try {
      await createRecipe.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        prepTimeMinutes: prepTime ? parseInt(prepTime, 10) : undefined,
        isPublic,
        ingredients: validIngredients.map((i) => ({
          name: i.name.trim(),
          quantity: i.quantity.trim() || undefined,
          unit: i.unit.trim() || undefined,
        })),
        steps: validSteps.map((s) => ({
          description: s.description.trim(),
        })),
      });
      router.back();
    } catch {
      Alert.alert(t('common.error'));
    }
  }, [title, description, prepTime, isPublic, ingredients, steps, createRecipe, router, t]);

  const canSave = title.trim().length > 0 && !createRecipe.isPending;

  return (
    <View className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 pb-3 border-b border-border"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.7 : 1 }}>
                <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
              </View>
            )}
          </Pressable>
          <Text className="text-text-primary font-semibold text-lg">
            {t('recipes.create_title')}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Input
            label={t('recipes.name_placeholder')}
            value={title}
            onChangeText={setTitle}
            placeholder={t('recipes.name_placeholder')}
            accessibilityLabel={t('recipes.name_placeholder')}
          />

          {/* Description */}
          <Input
            label={t('recipes.description_placeholder')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('recipes.description_placeholder')}
            multiline
            numberOfLines={3}
            accessibilityLabel={t('recipes.description_placeholder')}
          />

          {/* Prep time */}
          <Input
            label={t('recipes.prep_time_label')}
            value={prepTime}
            onChangeText={setPrepTime}
            placeholder="30"
            keyboardType="numeric"
            accessibilityLabel={t('recipes.prep_time_label')}
          />

          {/* Public toggle */}
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-text-primary text-base">{t('recipes.public')}</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.bgTertiary, true: colors.terracota }}
              thumbColor="white"
              accessibilityLabel={t('recipes.public')}
            />
          </View>

          {/* Ingredients */}
          <View className="gap-3">
            <Text className="text-text-primary font-semibold text-lg">
              {t('recipes.ingredients')}
            </Text>
            {ingredients.map((ing, index) => (
              <View key={ing.key} className="flex-row gap-2 items-start">
                <View className="pt-3">
                  <GripVertical size={16} color={colors.textTertiary} strokeWidth={1.5} />
                </View>
                <View className="flex-1 gap-2">
                  <Input
                    value={ing.name}
                    onChangeText={(v) => updateIngredient(ing.key, 'name', v)}
                    placeholder={t('recipes.ingredient_placeholder')}
                    accessibilityLabel={`${t('recipes.ingredient_placeholder')} ${index + 1}`}
                  />
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Input
                        value={ing.quantity}
                        onChangeText={(v) => updateIngredient(ing.key, 'quantity', v)}
                        placeholder={t('recipes.quantity_placeholder')}
                        accessibilityLabel={`${t('recipes.quantity_placeholder')} ${index + 1}`}
                      />
                    </View>
                    <View className="flex-1">
                      <Input
                        value={ing.unit}
                        onChangeText={(v) => updateIngredient(ing.key, 'unit', v)}
                        placeholder={t('recipes.unit_placeholder')}
                        accessibilityLabel={`${t('recipes.unit_placeholder')} ${index + 1}`}
                      />
                    </View>
                  </View>
                </View>
                {ingredients.length > 1 && (
                  <Pressable
                    onPress={() => removeIngredient(ing.key)}
                    className="pt-3"
                    accessibilityLabel={`${t('common.delete')} ${index + 1}`}
                    accessibilityRole="button"
                  >
                    {({ pressed }) => (
                      <View style={{ opacity: pressed ? 0.7 : 1 }}>
                        <X size={18} color={colors.error} strokeWidth={1.5} />
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable onPress={addIngredient} className="flex-row items-center gap-2 py-2">
              {({ pressed }) => (
                <View className="flex-row items-center gap-2" style={{ opacity: pressed ? 0.7 : 1 }}>
                  <Plus size={16} color={colors.brandBlue} strokeWidth={2} />
                  <Text className="text-brand-blue text-sm font-medium">
                    {t('recipes.add_ingredient')}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Steps */}
          <View className="gap-3">
            <Text className="text-text-primary font-semibold text-lg">{t('recipes.steps')}</Text>
            {steps.map((step, index) => (
              <View key={step.key} className="flex-row gap-2 items-start">
                <View className="w-7 h-7 rounded-full bg-brand-terracota items-center justify-center mt-1">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Input
                    value={step.description}
                    onChangeText={(v) => updateStep(step.key, v)}
                    placeholder={t('recipes.step_placeholder')}
                    multiline
                    numberOfLines={2}
                    accessibilityLabel={`${t('recipes.step_placeholder')} ${index + 1}`}
                  />
                </View>
                {steps.length > 1 && (
                  <Pressable
                    onPress={() => removeStep(step.key)}
                    className="pt-2"
                    accessibilityLabel={`${t('common.delete')} step ${index + 1}`}
                    accessibilityRole="button"
                  >
                    {({ pressed }) => (
                      <View style={{ opacity: pressed ? 0.7 : 1 }}>
                        <X size={18} color={colors.error} strokeWidth={1.5} />
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable onPress={addStep} className="flex-row items-center gap-2 py-2">
              {({ pressed }) => (
                <View className="flex-row items-center gap-2" style={{ opacity: pressed ? 0.7 : 1 }}>
                  <Plus size={16} color={colors.brandBlue} strokeWidth={2} />
                  <Text className="text-brand-blue text-sm font-medium">
                    {t('recipes.add_step')}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>

        {/* Save button */}
        <View
          className="px-4 pt-3 pb-2 border-t border-border bg-bg-primary"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <Button
            onPress={handleSave}
            loading={createRecipe.isPending}
            disabled={!canSave}
          >
            {t('common.save')}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

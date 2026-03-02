import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import type { Recipe, RecipeIngredient, RecipeStep } from '@fogon/types';

interface RawIngredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  position: number;
}

interface RawStep {
  id: string;
  step_number: number;
  description: string;
}

interface RawRecipeRow {
  id: string;
  title: string;
  description: string | null;
  prep_time_minutes: number | null;
  image_url: string | null;
  is_public: boolean;
  household_id: string | null;
  recipe_ingredients: RawIngredient[] | null;
  recipe_steps: RawStep[] | null;
}

function mapIngredient(raw: RawIngredient): RecipeIngredient {
  return { id: raw.id, name: raw.name, quantity: raw.quantity, unit: raw.unit };
}

function mapStep(raw: RawStep): RecipeStep {
  return { id: raw.id, stepNumber: raw.step_number, description: raw.description };
}

function mapRecipe(row: RawRecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prepTimeMinutes: row.prep_time_minutes,
    imageUrl: row.image_url,
    isPublic: row.is_public,
    isCurated: row.household_id === null,
    ingredients: (row.recipe_ingredients ?? [])
      .sort((a, b) => a.position - b.position)
      .map(mapIngredient),
    steps: (row.recipe_steps ?? [])
      .sort((a, b) => a.step_number - b.step_number)
      .map(mapStep),
  };
}

export function useRecipes() {
  const { household } = useHouseholdStore();

  return useQuery({
    queryKey: ['recipes', household?.id],
    queryFn: async (): Promise<Recipe[]> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_ingredients(*), recipe_steps(*)')
        .or(`household_id.is.null,household_id.eq.${household?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((row) => mapRecipe(row as unknown as RawRecipeRow));
    },
    enabled: !!household,
  });
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  prepTimeMinutes?: number;
  isPublic?: boolean;
  ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
  steps: Array<{ description: string }>;
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  const { household } = useHouseholdStore();

  return useMutation({
    mutationFn: async (input: CreateRecipeInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: recipe, error } = await supabase
        .from('recipes')
        .insert({
          household_id: household!.id,
          title: input.title,
          description: input.description ?? null,
          prep_time_minutes: input.prepTimeMinutes ?? null,
          is_public: input.isPublic ?? false,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (input.ingredients.length > 0) {
        const { error: ingErr } = await supabase.from('recipe_ingredients').insert(
          input.ingredients.map((ing, i) => ({
            recipe_id: recipe.id,
            name: ing.name,
            quantity: ing.quantity ?? null,
            unit: ing.unit ?? null,
            position: i,
          })),
        );
        if (ingErr) throw ingErr;
      }

      if (input.steps.length > 0) {
        const { error: stepErr } = await supabase.from('recipe_steps').insert(
          input.steps.map((step, i) => ({
            recipe_id: recipe.id,
            step_number: i + 1,
            description: step.description,
          })),
        );
        if (stepErr) throw stepErr;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  });
}

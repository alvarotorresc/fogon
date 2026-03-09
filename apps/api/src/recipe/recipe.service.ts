import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RecipeService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(RecipeService.name);

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async findAll(householdId: string) {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .or(`household_id.is.null,household_id.eq.${householdId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => this.mapRecipe(row));
  }

  async findById(householdId: string, recipeId: string) {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('id', recipeId)
      .or(`household_id.is.null,household_id.eq.${householdId}`)
      .single();

    if (error || !data) throw new NotFoundException('Recipe not found');

    return this.mapRecipe(data);
  }

  async create(
    householdId: string,
    userId: string,
    input: {
      title: string;
      description?: string;
      prepTimeMinutes?: number;
      isPublic?: boolean;
      ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
      steps: Array<{ description: string }>;
    },
  ) {
    const { data: recipe, error } = await this.supabase
      .from('recipes')
      .insert({
        household_id: householdId,
        title: input.title,
        description: input.description ?? null,
        prep_time_minutes: input.prepTimeMinutes ?? null,
        is_public: input.isPublic ?? false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (input.ingredients.length > 0) {
      const { error: ingErr } = await this.supabase.from('recipe_ingredients').insert(
        input.ingredients.map((ing, i) => ({
          recipe_id: recipe.id,
          name: ing.name,
          quantity: ing.quantity ?? null,
          unit: ing.unit ?? null,
          position: i,
        })),
      );
      if (ingErr) throw new Error(ingErr.message);
    }

    if (input.steps.length > 0) {
      const { error: stepErr } = await this.supabase.from('recipe_steps').insert(
        input.steps.map((step, i) => ({
          recipe_id: recipe.id,
          step_number: i + 1,
          description: step.description,
        })),
      );
      if (stepErr) throw new Error(stepErr.message);
    }

    return { id: recipe.id };
  }

  async addIngredientsToShopping(
    householdId: string,
    recipeId: string,
    userId: string,
  ): Promise<{ added: number }> {
    const recipe = await this.findById(householdId, recipeId);

    if (recipe.ingredients.length === 0) {
      return { added: 0 };
    }

    // Fetch existing non-done shopping items for this household to avoid duplicates
    const { data: existingItems, error: fetchError } = await this.supabase
      .from('shopping_items')
      .select('name')
      .eq('household_id', householdId)
      .eq('is_done', false);

    if (fetchError) throw new Error(fetchError.message);

    const existingNames = new Set(
      (existingItems ?? []).map((item: { name: string }) => item.name.toLowerCase()),
    );

    const newIngredients = recipe.ingredients.filter(
      (ing) => !existingNames.has((ing.name as string).toLowerCase()),
    );

    if (newIngredients.length === 0) {
      return { added: 0 };
    }

    const { error: insertError } = await this.supabase.from('shopping_items').insert(
      newIngredients.map((ing) => ({
        household_id: householdId,
        name: ing.name,
        quantity: ing.quantity
          ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}`
          : ing.unit ?? null,
        category: 'otros',
        added_by: userId,
      })),
    );

    if (insertError) throw new Error(insertError.message);

    this.logger.log(
      `Added ${newIngredients.length} ingredients from recipe ${recipeId} to shopping list for household ${householdId}`,
    );

    return { added: newIngredients.length };
  }

  async remove(householdId: string, recipeId: string) {
    const { data, error } = await this.supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('household_id', householdId)
      .select('id')
      .single();

    if (error || !data) throw new NotFoundException('Recipe not found');
  }

  async update(
    householdId: string,
    recipeId: string,
    input: {
      title: string;
      description?: string;
      prepTimeMinutes?: number;
      isPublic?: boolean;
      ingredients: Array<{ name: string; quantity?: string; unit?: string }>;
      steps: Array<{ description: string }>;
    },
  ) {
    const { data: recipe, error } = await this.supabase
      .from('recipes')
      .update({
        title: input.title,
        description: input.description ?? null,
        prep_time_minutes: input.prepTimeMinutes ?? null,
        is_public: input.isPublic ?? false,
      })
      .eq('id', recipeId)
      .eq('household_id', householdId)
      .select('id')
      .single();

    if (error || !recipe) throw new NotFoundException('Recipe not found');

    // Replace ingredients: delete old, insert new
    const { error: delIngErr } = await this.supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (delIngErr) throw new Error(delIngErr.message);

    if (input.ingredients.length > 0) {
      const { error: ingErr } = await this.supabase.from('recipe_ingredients').insert(
        input.ingredients.map((ing, i) => ({
          recipe_id: recipeId,
          name: ing.name,
          quantity: ing.quantity ?? null,
          unit: ing.unit ?? null,
          position: i,
        })),
      );
      if (ingErr) throw new Error(ingErr.message);
    }

    // Replace steps: delete old, insert new
    const { error: delStepErr } = await this.supabase
      .from('recipe_steps')
      .delete()
      .eq('recipe_id', recipeId);

    if (delStepErr) throw new Error(delStepErr.message);

    if (input.steps.length > 0) {
      const { error: stepErr } = await this.supabase.from('recipe_steps').insert(
        input.steps.map((step, i) => ({
          recipe_id: recipeId,
          step_number: i + 1,
          description: step.description,
        })),
      );
      if (stepErr) throw new Error(stepErr.message);
    }

    return { id: recipeId };
  }

  private mapRecipe(row: Record<string, unknown>) {
    const ingredients = (row.recipe_ingredients as Array<Record<string, unknown>> ?? [])
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((ing) => ({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      }));

    const steps = (row.recipe_steps as Array<Record<string, unknown>> ?? [])
      .sort((a, b) => (a.step_number as number) - (b.step_number as number))
      .map((s) => ({
        id: s.id,
        stepNumber: s.step_number,
        description: s.description,
      }));

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      prepTimeMinutes: row.prep_time_minutes,
      imageUrl: row.image_url,
      isPublic: row.is_public,
      isCurated: row.household_id === null,
      ingredients,
      steps,
    };
  }
}

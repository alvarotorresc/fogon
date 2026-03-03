import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RecipeService {
  private readonly supabase: SupabaseClient;

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

  async findById(recipeId: string) {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('id', recipeId)
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

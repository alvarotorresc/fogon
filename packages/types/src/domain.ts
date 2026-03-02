import type { HouseholdRole, StockLevel, MealSlot } from './database';

export type { HouseholdRole, StockLevel, MealSlot };

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  members: HouseholdMember[];
}

export interface HouseholdMember {
  id: string;
  userId: string;
  displayName: string;
  avatarColor: string;
  role: HouseholdRole;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  isDone: boolean;
  doneByName: string | null;
  addedByName: string;
  createdAt: string;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  stockLevel: StockLevel;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prepTimeMinutes: number | null;
  imageUrl: string | null;
  isPublic: boolean;
  isCurated: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  description: string;
}

export interface MealPlanEntry {
  id: string;
  dayOfWeek: number;
  slot: MealSlot;
  recipe: Pick<Recipe, 'id' | 'title' | 'imageUrl'> | null;
  customText: string | null;
}

export interface WeeklyMealPlan {
  weekStart: string;
  entries: MealPlanEntry[];
}

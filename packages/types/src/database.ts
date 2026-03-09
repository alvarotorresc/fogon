export type HouseholdRole = 'owner' | 'member';
export type StockLevel = 'ok' | 'low' | 'empty';
export type MealSlot = 'lunch' | 'dinner';

export interface DbHousehold {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface DbHouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  display_name: string;
  avatar_color: string;
  role: HouseholdRole;
  joined_at: string;
}

export interface DbShoppingItem {
  id: string;
  household_id: string;
  name: string;
  quantity: string | null;
  category: string;
  is_done: boolean;
  done_by: string | null;
  done_at: string | null;
  added_by: string;
  created_at: string;
}

export interface DbPantryItem {
  id: string;
  household_id: string;
  name: string;
  quantity: string | null;
  category: string;
  stock_level: StockLevel;
  added_by: string;
  updated_at: string;
}

export interface DbRecipe {
  id: string;
  household_id: string | null;
  title: string;
  description: string | null;
  prep_time_minutes: number | null;
  image_url: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

export interface DbRecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  position: number;
}

export interface DbRecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  description: string;
}

export interface DbMealPlanEntry {
  id: string;
  household_id: string;
  week_start: string;
  day_of_week: number;
  slot: MealSlot;
  recipe_id: string | null;
  custom_text: string | null;
  created_by: string;
  created_at: string;
}

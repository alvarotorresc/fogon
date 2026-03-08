/**
 * Centralized staleTime configuration per data domain.
 * Determines how long data is considered fresh before refetching.
 */
export const STALE_TIMES = {
  /** Recipes change infrequently */
  recipes: 1000 * 60 * 10, // 10 minutes
  /** Pantry items change moderately */
  pantry: 1000 * 60 * 5, // 5 minutes
  /** Shopping list is collaborative — needs frequent updates */
  shopping: 1000 * 30, // 30 seconds
  /** Meal plans change infrequently */
  mealPlan: 1000 * 60 * 10, // 10 minutes
} as const;

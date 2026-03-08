import type { Recipe } from '@fogon/types';
import { formatRecipeForSharing } from './formatRecipeForSharing';

const fullRecipe: Recipe = {
  id: 'r-1',
  title: 'Pasta Carbonara',
  description: 'Classic Italian dish',
  prepTimeMinutes: 30,
  imageUrl: null,
  isPublic: false,
  isCurated: false,
  ingredients: [
    { id: 'i-1', name: 'Spaghetti', quantity: '400', unit: 'g' },
    { id: 'i-2', name: 'Eggs', quantity: '3', unit: null },
    { id: 'i-3', name: 'Pecorino', quantity: null, unit: null },
  ],
  steps: [
    { id: 's-1', stepNumber: 1, description: 'Boil water and cook pasta' },
    { id: 's-2', stepNumber: 2, description: 'Mix eggs with cheese' },
    { id: 's-3', stepNumber: 3, description: 'Combine and serve' },
  ],
};

const minimalRecipe: Recipe = {
  id: 'r-2',
  title: 'Quick Salad',
  description: null,
  prepTimeMinutes: null,
  imageUrl: null,
  isPublic: false,
  isCurated: false,
  ingredients: [],
  steps: [],
};

describe('formatRecipeForSharing', () => {
  it('should format a full recipe with all fields', () => {
    const result = formatRecipeForSharing(fullRecipe);

    expect(result).toContain('🍳 Pasta Carbonara');
    expect(result).toContain('⏱ 30 min');
    expect(result).toContain('Classic Italian dish');
    expect(result).toContain('📝 Ingredients:');
    expect(result).toContain('  - Spaghetti 400 g');
    expect(result).toContain('  - Eggs 3');
    expect(result).toContain('  - Pecorino');
    expect(result).toContain('👨‍🍳 Steps:');
    expect(result).toContain('  1. Boil water and cook pasta');
    expect(result).toContain('  2. Mix eggs with cheese');
    expect(result).toContain('  3. Combine and serve');
    expect(result).toContain('Shared from Fogón 🔥');
  });

  it('should handle a minimal recipe with no optional fields', () => {
    const result = formatRecipeForSharing(minimalRecipe);

    expect(result).toContain('🍳 Quick Salad');
    expect(result).not.toContain('⏱');
    expect(result).not.toContain('📝 Ingredients:');
    expect(result).not.toContain('👨‍🍳 Steps:');
    expect(result).toContain('Shared from Fogón 🔥');
  });

  it('should not include description line when description is null', () => {
    const result = formatRecipeForSharing(minimalRecipe);
    const lines = result.split('\n').filter((l) => l.trim() !== '');

    expect(lines).toEqual(['🍳 Quick Salad', 'Shared from Fogón 🔥']);
  });

  it('should format ingredient with only name (no quantity or unit)', () => {
    const recipe: Recipe = {
      ...minimalRecipe,
      ingredients: [{ id: 'i-1', name: 'Salt', quantity: null, unit: null }],
    };
    const result = formatRecipeForSharing(recipe);

    expect(result).toContain('  - Salt');
    expect(result).not.toContain('  - Salt ');
  });

  it('should format ingredient with quantity but no unit', () => {
    const recipe: Recipe = {
      ...minimalRecipe,
      ingredients: [{ id: 'i-1', name: 'Tomatoes', quantity: '2', unit: null }],
    };
    const result = formatRecipeForSharing(recipe);

    expect(result).toContain('  - Tomatoes 2');
  });
});

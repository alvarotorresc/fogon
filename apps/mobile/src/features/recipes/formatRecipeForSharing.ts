import type { Recipe } from '@fogon/types';

export function formatRecipeForSharing(recipe: Recipe): string {
  const lines: string[] = [];

  lines.push(`🍳 ${recipe.title}`);

  if (recipe.prepTimeMinutes !== null) {
    lines.push(`⏱ ${recipe.prepTimeMinutes} min`);
  }

  if (recipe.description) {
    lines.push('');
    lines.push(recipe.description);
  }

  if (recipe.ingredients.length > 0) {
    lines.push('');
    lines.push('📝 Ingredients:');
    for (const ing of recipe.ingredients) {
      const parts = [ing.name];
      if (ing.quantity) parts.push(ing.quantity);
      if (ing.unit) parts.push(ing.unit);
      lines.push(`  - ${parts.join(' ')}`);
    }
  }

  if (recipe.steps.length > 0) {
    lines.push('');
    lines.push('👨‍🍳 Steps:');
    for (const step of recipe.steps) {
      lines.push(`  ${step.stepNumber}. ${step.description}`);
    }
  }

  lines.push('');
  lines.push('Shared from Fogón 🔥');

  return lines.join('\n');
}

export const SHOPPING_CATEGORIES = [
  { key: 'frutas', icon: '🥦' },
  { key: 'lacteos', icon: '🥛' },
  { key: 'carnes', icon: '🥩' },
  { key: 'panaderia', icon: '🍞' },
  { key: 'conservas', icon: '🥫' },
  { key: 'limpieza', icon: '🧹' },
  { key: 'otros', icon: '📦' },
] as const;

export type ShoppingCategoryKey = (typeof SHOPPING_CATEGORIES)[number]['key'];

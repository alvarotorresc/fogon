import { useState, useMemo } from 'react';
import { useDebounce } from '@/lib/useDebounce';

type FilterOption = 'all' | 'curated' | 'mine';

interface FilterableRecipe {
  title: string;
  isCurated: boolean;
}

export function filterRecipes<T extends FilterableRecipe>(
  items: T[],
  query: string,
  filter: FilterOption,
): T[] {
  let result = items;

  switch (filter) {
    case 'curated':
      result = result.filter((r) => r.isCurated);
      break;
    case 'mine':
      result = result.filter((r) => !r.isCurated);
      break;
  }

  const trimmed = query.trim().toLowerCase();
  if (trimmed) {
    result = result.filter((r) => r.title.toLowerCase().includes(trimmed));
  }

  return result;
}

export function useRecipeSearch<T extends FilterableRecipe>(recipes: T[]) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, debouncedSearch, filter),
    [recipes, debouncedSearch, filter],
  );

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    filteredRecipes,
  };
}

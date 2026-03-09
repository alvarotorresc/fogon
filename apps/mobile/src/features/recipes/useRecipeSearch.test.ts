import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '@/lib/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: '' } },
    );

    expect(result.current).toBe('');

    rerender({ value: 'pa' });
    expect(result.current).toBe('');

    rerender({ value: 'pasta' });
    expect(result.current).toBe('');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('pasta');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: '' } },
    );

    rerender({ value: 'a' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abc' });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abc');
  });
});

describe('Recipe search filtering', () => {
  const recipes = [
    { id: '1', title: 'Pasta Carbonara', isCurated: true },
    { id: '2', title: 'Chicken Curry', isCurated: false },
    { id: '3', title: 'Pasta Bolognese', isCurated: true },
    { id: '4', title: 'Greek Salad', isCurated: false },
  ];

  function filterRecipes(
    items: typeof recipes,
    query: string,
    filter: 'all' | 'curated' | 'mine',
  ) {
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

  it('should return all recipes when query is empty and filter is all', () => {
    const result = filterRecipes(recipes, '', 'all');
    expect(result).toHaveLength(4);
  });

  it('should filter by name case-insensitively', () => {
    const result = filterRecipes(recipes, 'pasta', 'all');
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('should combine name filter with curated filter', () => {
    const result = filterRecipes(recipes, 'pasta', 'curated');
    expect(result).toHaveLength(2);
  });

  it('should combine name filter with mine filter', () => {
    const result = filterRecipes(recipes, 'chicken', 'mine');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Chicken Curry');
  });

  it('should return empty when no match', () => {
    const result = filterRecipes(recipes, 'sushi', 'all');
    expect(result).toHaveLength(0);
  });

  it('should handle whitespace-only query as empty', () => {
    const result = filterRecipes(recipes, '   ', 'all');
    expect(result).toHaveLength(4);
  });
});

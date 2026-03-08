import { STALE_TIMES } from './queryKeys';

describe('STALE_TIMES', () => {
  it('should set recipes staleTime to 10 minutes', () => {
    expect(STALE_TIMES.recipes).toBe(1000 * 60 * 10);
  });

  it('should set pantry staleTime to 5 minutes', () => {
    expect(STALE_TIMES.pantry).toBe(1000 * 60 * 5);
  });

  it('should set shopping staleTime to 30 seconds', () => {
    expect(STALE_TIMES.shopping).toBe(1000 * 30);
  });

  it('should set mealPlan staleTime to 10 minutes', () => {
    expect(STALE_TIMES.mealPlan).toBe(1000 * 60 * 10);
  });

  it('should have shopping as the shortest staleTime (most collaborative)', () => {
    expect(STALE_TIMES.shopping).toBeLessThan(STALE_TIMES.pantry);
    expect(STALE_TIMES.shopping).toBeLessThan(STALE_TIMES.recipes);
    expect(STALE_TIMES.shopping).toBeLessThan(STALE_TIMES.mealPlan);
  });
});

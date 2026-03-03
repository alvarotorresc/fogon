import { getWeekStart } from './useMealPlan';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/store/householdStore', () => ({
  useHouseholdStore: () => ({ household: null }),
}));

describe('getWeekStart', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return YYYY-MM-DD format string', () => {
    const result = getWeekStart(0);

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return Monday of current week when offset is 0', () => {
    // Wednesday 2026-03-04
    jest.useFakeTimers({ now: new Date(2026, 2, 4, 12, 0, 0) });

    const result = getWeekStart(0);

    expect(result).toBe('2026-03-02'); // Monday
  });

  it('should return previous Monday when offset is -1', () => {
    // Wednesday 2026-03-04
    jest.useFakeTimers({ now: new Date(2026, 2, 4, 12, 0, 0) });

    const result = getWeekStart(-1);

    expect(result).toBe('2026-02-23'); // Previous Monday
  });

  it('should return next Monday when offset is 1', () => {
    // Wednesday 2026-03-04
    jest.useFakeTimers({ now: new Date(2026, 2, 4, 12, 0, 0) });

    const result = getWeekStart(1);

    expect(result).toBe('2026-03-09'); // Next Monday
  });

  it('should handle Sunday edge case (day === 0)', () => {
    // Sunday 2026-03-08
    jest.useFakeTimers({ now: new Date(2026, 2, 8, 12, 0, 0) });

    const result = getWeekStart(0);

    expect(result).toBe('2026-03-02'); // Monday of that week, not next Monday
  });

  it('should handle Monday itself correctly', () => {
    // Monday 2026-03-02
    jest.useFakeTimers({ now: new Date(2026, 2, 2, 12, 0, 0) });

    const result = getWeekStart(0);

    expect(result).toBe('2026-03-02'); // Same Monday
  });

  it('should handle Saturday correctly', () => {
    // Saturday 2026-03-07
    jest.useFakeTimers({ now: new Date(2026, 2, 7, 12, 0, 0) });

    const result = getWeekStart(0);

    expect(result).toBe('2026-03-02'); // Monday of that week
  });

  it('should default offset to 0 when not provided', () => {
    // Wednesday 2026-03-04
    jest.useFakeTimers({ now: new Date(2026, 2, 4, 12, 0, 0) });

    const withDefault = getWeekStart();
    const withZero = getWeekStart(0);

    expect(withDefault).toBe(withZero);
  });

  it('should handle month boundary crossing', () => {
    // Tuesday 2026-03-03
    jest.useFakeTimers({ now: new Date(2026, 2, 3, 12, 0, 0) });

    const result = getWeekStart(-1);

    expect(result).toBe('2026-02-23'); // Crosses into February
  });
});

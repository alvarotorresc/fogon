import { asyncStoragePersister, persistOptions } from './queryPersister';

describe('queryPersister', () => {
  it('should export a persister instance', () => {
    expect(asyncStoragePersister).toBeDefined();
  });

  it('should set maxAge to 24 hours', () => {
    const twentyFourHoursMs = 1000 * 60 * 60 * 24;
    expect(persistOptions.maxAge).toBe(twentyFourHoursMs);
  });

  it('should use the persister in persistOptions', () => {
    expect(persistOptions.persister).toBe(asyncStoragePersister);
  });
});

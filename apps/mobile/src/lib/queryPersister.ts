import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'fogon-query-cache',
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: CACHE_MAX_AGE_MS,
} as const;

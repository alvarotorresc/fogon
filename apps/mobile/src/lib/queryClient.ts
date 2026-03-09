import { QueryClient } from '@tanstack/react-query';
import { getErrorMessage, getHttpStatus } from './api-error';
import { useErrorStore } from '@/store/errorStore';

function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = getHttpStatus(error);
  if (status === 401 || status === 403 || status === 404 || status === 422) return false;
  return failureCount < 2;
}

const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: CACHE_MAX_AGE_MS,
      networkMode: 'offlineFirst',
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: false,
      onError: (error: unknown) => {
        const message = getErrorMessage(error);
        useErrorStore.getState().showError(message);
      },
    },
  },
});

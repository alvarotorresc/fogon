import type { AxiosError } from 'axios';
import i18n from './i18n';

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorResponse).error?.code === 'string' &&
    typeof (data as ApiErrorResponse).error?.message === 'string'
  );
}

function getStatusMessage(status: number): string {
  const key = `errors.http_${status}`;
  const translated = i18n.t(key);
  if (translated !== key) return translated;

  const fallbacks: Record<number, string> = {
    401: 'Session expired, please log in again',
    403: "You don't have permission for this action",
    404: 'The requested resource was not found',
    409: 'This action conflicts with existing data',
    422: 'The data provided is not valid',
    429: 'Too many requests, please wait a moment',
    500: 'Something went wrong, please try again',
  };

  return fallbacks[status] ?? i18n.t('errors.generic');
}

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return i18n.t('errors.generic');
  }

  if (!error.response) {
    return i18n.t('errors.network');
  }

  const { status, data } = error.response;

  if (isApiErrorResponse(data)) {
    return data.error.message;
  }

  return getStatusMessage(status);
}

export function getErrorCode(error: unknown): string | undefined {
  if (!isAxiosError(error) || !error.response) return undefined;
  const { data } = error.response;
  if (isApiErrorResponse(data)) return data.error.code;
  return undefined;
}

export function getHttpStatus(error: unknown): number | undefined {
  if (!isAxiosError(error)) return undefined;
  return error.response?.status;
}

export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !error.response;
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

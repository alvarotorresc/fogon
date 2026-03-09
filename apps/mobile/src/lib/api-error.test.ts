import { getErrorMessage, getErrorCode, getHttpStatus, isNetworkError } from './api-error';

jest.mock('./i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.generic': 'Something went wrong',
        'errors.network': 'No internet connection',
        'errors.http_401': 'Session expired, please log in again',
        'errors.http_403': "You don't have permission for this action",
        'errors.http_404': 'The requested resource was not found',
        'errors.http_429': 'Too many requests, please wait a moment',
        'errors.http_500': 'Something went wrong, please try again',
      };
      return translations[key] ?? key;
    },
  },
}));

function makeAxiosError(
  status: number,
  data: unknown,
): { isAxiosError: true; response: { status: number; data: unknown } } {
  return { isAxiosError: true, response: { status, data } };
}

function makeNetworkError(): { isAxiosError: true; response: undefined; message: string } {
  return { isAxiosError: true, response: undefined, message: 'Network Error' };
}

describe('getErrorMessage', () => {
  it('should extract message from API error response', () => {
    const error = makeAxiosError(400, {
      error: { code: 'BAD_REQUEST', message: 'Email is required' },
    });
    expect(getErrorMessage(error)).toBe('Email is required');
  });

  it('should return translated message for known status codes', () => {
    const error = makeAxiosError(401, { unexpected: 'format' });
    expect(getErrorMessage(error)).toBe('Session expired, please log in again');
  });

  it('should return network error message when no response', () => {
    const error = makeNetworkError();
    expect(getErrorMessage(error)).toBe('No internet connection');
  });

  it('should return generic message for unknown status codes', () => {
    const error = makeAxiosError(418, { unexpected: 'teapot' });
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('should return error.message for non-axios Error instances', () => {
    const error = new Error('Custom error');
    expect(getErrorMessage(error)).toBe('Custom error');
  });

  it('should return generic message for unknown error types', () => {
    expect(getErrorMessage('string error')).toBe('Something went wrong');
    expect(getErrorMessage(null)).toBe('Something went wrong');
    expect(getErrorMessage(undefined)).toBe('Something went wrong');
  });

  it('should handle 403 forbidden', () => {
    const error = makeAxiosError(403, {
      error: { code: 'FORBIDDEN', message: 'Not a household member' },
    });
    expect(getErrorMessage(error)).toBe('Not a household member');
  });

  it('should handle 404 not found with API message', () => {
    const error = makeAxiosError(404, {
      error: { code: 'NOT_FOUND', message: 'Recipe not found' },
    });
    expect(getErrorMessage(error)).toBe('Recipe not found');
  });

  it('should handle 500 without API error body', () => {
    const error = makeAxiosError(500, 'Internal Server Error');
    expect(getErrorMessage(error)).toBe('Something went wrong, please try again');
  });

  it('should handle 429 too many requests', () => {
    const error = makeAxiosError(429, null);
    expect(getErrorMessage(error)).toBe('Too many requests, please wait a moment');
  });
});

describe('getErrorCode', () => {
  it('should extract code from API error response', () => {
    const error = makeAxiosError(400, {
      error: { code: 'VALIDATION_ERROR', message: 'Invalid data' },
    });
    expect(getErrorCode(error)).toBe('VALIDATION_ERROR');
  });

  it('should return undefined for non-API error responses', () => {
    const error = makeAxiosError(500, 'text');
    expect(getErrorCode(error)).toBeUndefined();
  });

  it('should return undefined for non-axios errors', () => {
    expect(getErrorCode(new Error('oops'))).toBeUndefined();
  });
});

describe('getHttpStatus', () => {
  it('should return status from axios error', () => {
    const error = makeAxiosError(404, {});
    expect(getHttpStatus(error)).toBe(404);
  });

  it('should return undefined for network errors', () => {
    const error = makeNetworkError();
    expect(getHttpStatus(error)).toBeUndefined();
  });

  it('should return undefined for non-axios errors', () => {
    expect(getHttpStatus(new Error('oops'))).toBeUndefined();
  });
});

describe('isNetworkError', () => {
  it('should return true when no response', () => {
    expect(isNetworkError(makeNetworkError())).toBe(true);
  });

  it('should return false when response exists', () => {
    expect(isNetworkError(makeAxiosError(500, {}))).toBe(false);
  });

  it('should return false for non-axios errors', () => {
    expect(isNetworkError(new Error('oops'))).toBe(false);
  });
});

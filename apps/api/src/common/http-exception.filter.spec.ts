import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockSend: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ send: mockSend });
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it('returns sanitized error for HttpException with string response', () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockSend).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Not found' },
    });
  });

  it('returns sanitized error for HttpException with object response', () => {
    const exception = new HttpException(
      { message: ['field must be string', 'field is required'] },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockSend).toHaveBeenCalledWith({
      error: { code: 'BAD_REQUEST', message: 'field must be string, field is required' },
    });
  });

  it('returns generic error for unknown exceptions', () => {
    filter.catch(new Error('db crashed'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockSend).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  });

  it('handles 429 Too Many Requests', () => {
    const exception = new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(429);
    expect(mockSend).toHaveBeenCalledWith({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' },
    });
  });
});

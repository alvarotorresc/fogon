import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { SupabaseService } from '../supabase/supabase.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockGetUser: jest.Mock;

  beforeEach(() => {
    mockGetUser = jest.fn();
    const mockSupabaseService = {
      getClient: () => ({
        auth: { getUser: mockGetUser },
      }),
    } as unknown as SupabaseService;

    guard = new JwtAuthGuard(mockSupabaseService);
  });

  function createMockContext(authHeader?: string): ExecutionContext {
    const request = { headers: { authorization: authHeader }, userId: undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('throws UnauthorizedException when no auth header', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when auth header is not Bearer', async () => {
    const context = createMockContext('Basic abc');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid' } });
    const context = createMockContext('Bearer bad-token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches userId to request and returns true for valid token', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    const context = createMockContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.userId).toBe('user-123');
    expect(mockGetUser).toHaveBeenCalledWith('valid-token');
  });
});

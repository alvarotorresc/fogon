import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { HouseholdMemberGuard } from './household-member.guard';
import { SupabaseService } from '../../supabase/supabase.service';

describe('HouseholdMemberGuard', () => {
  let guard: HouseholdMemberGuard;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    mockFrom = jest.fn();
    const mockSupabaseService = {
      getClient: () => ({ from: mockFrom }),
    } as unknown as SupabaseService;

    guard = new HouseholdMemberGuard(mockSupabaseService);
  });

  function createMockContext(params: Record<string, string>, userId?: string): ExecutionContext {
    const request = { params, userId };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('throws ForbiddenException when householdId is missing from params', async () => {
    const context = createMockContext({}, 'user-1');
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when userId is missing from request', async () => {
    const context = createMockContext({ householdId: 'h-1' }, undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is not a member of the household', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }),
    });

    const context = createMockContext({ householdId: 'h-1' }, 'user-1');
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('returns true when user is a member of the household', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => ({
              data: { id: 'member-1', household_id: 'h-1', user_id: 'user-1' },
              error: null,
            }),
          }),
        }),
      }),
    });

    const context = createMockContext({ householdId: 'h-1' }, 'user-1');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('queries household_members with correct householdId and userId', async () => {
    const mockEqUserId = jest.fn().mockReturnValue({
      single: () => ({
        data: { id: 'member-1' },
        error: null,
      }),
    });
    const mockEqHouseholdId = jest.fn().mockReturnValue({ eq: mockEqUserId });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEqHouseholdId });
    mockFrom.mockReturnValue({ select: mockSelect });

    const context = createMockContext({ householdId: 'h-42' }, 'user-99');
    await guard.canActivate(context);

    expect(mockFrom).toHaveBeenCalledWith('household_members');
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(mockEqHouseholdId).toHaveBeenCalledWith('household_id', 'h-42');
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'user-99');
  });
});

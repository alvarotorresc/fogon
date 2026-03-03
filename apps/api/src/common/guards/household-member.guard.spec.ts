import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { HouseholdMemberGuard } from './household-member.guard';
import { SupabaseService } from '../../supabase/supabase.service';

const VALID_HID = '00000000-0000-0000-0000-000000000001';
const VALID_UID = '00000000-0000-0000-0000-000000000099';

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
    const context = createMockContext({ householdId: VALID_HID }, undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when householdId is not a valid UUID', async () => {
    const context = createMockContext({ householdId: 'not-a-uuid' }, VALID_UID);
    await expect(guard.canActivate(context)).rejects.toThrow(BadRequestException);
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

    const context = createMockContext({ householdId: VALID_HID }, VALID_UID);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('returns true when user is a member of the household', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => ({
              data: { id: 'member-1', household_id: VALID_HID, user_id: VALID_UID },
              error: null,
            }),
          }),
        }),
      }),
    });

    const context = createMockContext({ householdId: VALID_HID }, VALID_UID);
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

    const hid = '11111111-1111-1111-1111-111111111111';
    const uid = '22222222-2222-2222-2222-222222222222';
    const context = createMockContext({ householdId: hid }, uid);
    await guard.canActivate(context);

    expect(mockFrom).toHaveBeenCalledWith('household_members');
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(mockEqHouseholdId).toHaveBeenCalledWith('household_id', hid);
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', uid);
  });
});

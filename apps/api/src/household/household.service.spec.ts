import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { HouseholdService } from './household.service';

const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mockFrom }),
}));

describe('HouseholdService', () => {
  let service: HouseholdService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseholdService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const map: Record<string, string> = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: 'test-key',
              };
              return map[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<HouseholdService>(HouseholdService);
  });

  describe('joinByInviteCode', () => {
    it('throws NotFoundException for invalid invite code', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      await expect(
        service.joinByInviteCode('user-1', 'BADCODE1', 'John'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if already a member', async () => {
      const selectChain = jest.fn();
      let callCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'households') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: { id: 'h-1', name: 'Test', invite_code: 'ABCD1234', created_at: '2026-01-01' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'household_members') {
          callCount++;
          if (callCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () => ({ data: { id: 'existing' }, error: null }),
                  }),
                }),
              }),
            };
          }
        }
        return { select: selectChain };
      });

      await expect(
        service.joinByInviteCode('user-1', 'ABCD1234', 'John'),
      ).rejects.toThrow(ConflictException);
    });

    it('successfully joins household with valid code', async () => {
      let memberCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'households') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: { id: 'h-1', name: 'Test Home', invite_code: 'ABCD1234', created_at: '2026-01-01' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'household_members') {
          memberCallCount++;
          if (memberCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () => ({ data: null, error: { code: 'PGRST116' } }),
                  }),
                }),
              }),
            };
          }
          if (memberCallCount === 2) {
            return {
              select: () => ({
                eq: () => ({ count: 1, error: null }),
              }),
            };
          }
          if (memberCallCount === 3) {
            return {
              insert: () => ({ error: null }),
            };
          }
        }
        return {};
      });

      const result = await service.joinByInviteCode('user-2', 'ABCD1234', 'Jane');
      expect(result).toEqual({
        id: 'h-1',
        name: 'Test Home',
        inviteCode: 'ABCD1234',
        createdAt: '2026-01-01',
      });
    });
  });
});

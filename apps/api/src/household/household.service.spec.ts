import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

const mockFrom = jest.fn();
const mockSendToHousehold = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-server-sdk', () => {
  function MockExpo() {
    return {};
  }
  MockExpo.isExpoPushToken = () => true;
  return { __esModule: true, default: MockExpo };
});

describe('HouseholdService', () => {
  let service: HouseholdService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseholdService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendToHousehold: mockSendToHousehold,
          },
        },
      ],
    }).compile();

    service = module.get<HouseholdService>(HouseholdService);
  });

  describe('create', () => {
    it('should create household, add member as owner, and seed recipes', async () => {
      let memberInsertCalled = false;
      const recipeInserts: Array<Record<string, unknown>> = [];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'households') {
          return {
            insert: () => ({
              select: () => ({
                single: () => ({
                  data: {
                    id: 'h-new',
                    name: 'My Home',
                    invite_code: 'NEWCODE1',
                    created_at: '2026-03-01',
                    created_by: 'user-1',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'household_members') {
          return {
            insert: (data: Record<string, unknown>) => {
              memberInsertCalled = true;
              expect(data).toEqual({
                household_id: 'h-new',
                user_id: 'user-1',
                display_name: 'My Home',
                avatar_color: '#8B5CF6',
                role: 'owner',
              });
              return { error: null };
            },
          };
        }
        if (table === 'recipes') {
          return {
            insert: (data: Record<string, unknown>) => {
              recipeInserts.push(data);
              return {
                select: () => ({
                  single: () => ({
                    data: { id: `recipe-${recipeInserts.length}` },
                    error: null,
                  }),
                }),
              };
            },
          };
        }
        if (table === 'recipe_ingredients' || table === 'recipe_steps') {
          return {
            insert: () => ({ error: null }),
          };
        }
        return {};
      });

      const result = await service.create('user-1', 'My Home');

      // Wait for the async seed to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result).toEqual({
        id: 'h-new',
        name: 'My Home',
        inviteCode: 'NEWCODE1',
        createdAt: '2026-03-01',
      });
      expect(memberInsertCalled).toBe(true);
      expect(recipeInserts.length).toBe(5);
      expect(recipeInserts[0]).toEqual(
        expect.objectContaining({
          household_id: 'h-new',
          title: 'Tortilla de patatas',
          is_public: false,
          created_by: 'user-1',
        }),
      );
    });

    it('should throw error when household insert fails', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'households') {
          return {
            insert: () => ({
              select: () => ({
                single: () => ({
                  data: null,
                  error: { message: 'Insert failed' },
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(service.create('user-1', 'Bad Home')).rejects.toThrow('Insert failed');
    });

    it('should throw error when member insert fails', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'households') {
          return {
            insert: () => ({
              select: () => ({
                single: () => ({
                  data: {
                    id: 'h-new',
                    name: 'My Home',
                    invite_code: 'NEWCODE1',
                    created_at: '2026-03-01',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'household_members') {
          return {
            insert: () => ({ error: { message: 'Member insert failed' } }),
          };
        }
        return {};
      });

      await expect(service.create('user-1', 'My Home')).rejects.toThrow('Member insert failed');
    });
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

  describe('leave', () => {
    it('should delete household when last member leaves', async () => {
      let householdDeleteCalled = false;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'household_members') {
          return {
            select: () => ({
              eq: () => ({ count: 1, error: null }),
            }),
          };
        }
        if (table === 'households') {
          return {
            delete: () => ({
              eq: () => {
                householdDeleteCalled = true;
                return { error: null };
              },
            }),
          };
        }
        return {};
      });

      const result = await service.leave('user-1', 'h-1');

      expect(result).toEqual({ deleted: true });
      expect(householdDeleteCalled).toBe(true);
    });

    it('should remove member when not the last one and not owner', async () => {
      let memberDeleteCalled = false;
      let memberCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'household_members') {
          memberCallCount++;
          if (memberCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({ count: 2, error: null }),
              }),
            };
          }
          if (memberCallCount === 2) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () => ({ data: { role: 'member' }, error: null }),
                  }),
                }),
              }),
            };
          }
          if (memberCallCount === 3) {
            return {
              delete: () => ({
                eq: () => ({
                  eq: () => {
                    memberDeleteCalled = true;
                    return { error: null };
                  },
                }),
              }),
            };
          }
        }
        return {};
      });

      const result = await service.leave('user-2', 'h-1');

      expect(result).toEqual({ deleted: false });
      expect(memberDeleteCalled).toBe(true);
    });

    it('should throw ForbiddenException when owner tries to leave with other members', async () => {
      let memberCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'household_members') {
          memberCallCount++;
          if (memberCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({ count: 2, error: null }),
              }),
            };
          }
          if (memberCallCount === 2) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () => ({ data: { role: 'owner' }, error: null }),
                  }),
                }),
              }),
            };
          }
        }
        return {};
      });

      await expect(service.leave('user-1', 'h-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw error when count query fails', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'household_members') {
          return {
            select: () => ({
              eq: () => ({ count: null, error: { message: 'Count failed' } }),
            }),
          };
        }
        return {};
      });

      await expect(service.leave('user-1', 'h-1')).rejects.toThrow('Count failed');
    });

    it('should throw error when household delete fails', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'household_members') {
          return {
            select: () => ({
              eq: () => ({ count: 1, error: null }),
            }),
          };
        }
        if (table === 'households') {
          return {
            delete: () => ({
              eq: () => ({ error: { message: 'Delete failed' } }),
            }),
          };
        }
        return {};
      });

      await expect(service.leave('user-1', 'h-1')).rejects.toThrow('Delete failed');
    });

    it('should throw error when member remove fails', async () => {
      let memberCallCount = 0;

      mockFrom.mockImplementation((table: string) => {
        if (table === 'household_members') {
          memberCallCount++;
          if (memberCallCount === 1) {
            return {
              select: () => ({
                eq: () => ({ count: 2, error: null }),
              }),
            };
          }
          if (memberCallCount === 2) {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () => ({ data: { role: 'member' }, error: null }),
                  }),
                }),
              }),
            };
          }
          if (memberCallCount === 3) {
            return {
              delete: () => ({
                eq: () => ({
                  eq: () => ({ error: { message: 'Remove failed' } }),
                }),
              }),
            };
          }
        }
        return {};
      });

      await expect(service.leave('user-2', 'h-1')).rejects.toThrow('Remove failed');
    });
  });

  describe('findMembers', () => {
    it('returns mapped members ordered by joined_at', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: [
                {
                  id: 'm-1',
                  user_id: 'user-1',
                  display_name: 'Alice',
                  avatar_color: '#8B5CF6',
                  role: 'owner',
                  joined_at: '2026-01-01',
                },
                {
                  id: 'm-2',
                  user_id: 'user-2',
                  display_name: 'Bob',
                  avatar_color: '#3B82F6',
                  role: 'member',
                  joined_at: '2026-02-01',
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.findMembers('h-1');

      expect(result).toEqual([
        {
          id: 'm-1',
          userId: 'user-1',
          displayName: 'Alice',
          avatarColor: '#8B5CF6',
          role: 'owner',
          joinedAt: '2026-01-01',
        },
        {
          id: 'm-2',
          userId: 'user-2',
          displayName: 'Bob',
          avatarColor: '#3B82F6',
          role: 'member',
          joinedAt: '2026-02-01',
        },
      ]);
    });

    it('throws on supabase error', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: null,
              error: { message: 'Query failed' },
            }),
          }),
        }),
      });

      await expect(service.findMembers('h-1')).rejects.toThrow('Query failed');
    });
  });
});

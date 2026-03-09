import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();

const mockSendPushNotificationsAsync = jest.fn().mockResolvedValue([{ status: 'ok' }]);
const mockChunkPushNotifications = jest.fn((messages: unknown[]) => [messages]);

jest.mock('expo-server-sdk', () => {
  function MockExpo() {
    return {
      sendPushNotificationsAsync: mockSendPushNotificationsAsync,
      chunkPushNotifications: mockChunkPushNotifications,
    };
  }
  MockExpo.isExpoPushToken = (token: string) => token.startsWith('ExponentPushToken[');
  return { __esModule: true, default: MockExpo };
});

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('registerToken', () => {
    it('upserts push token for the user', async () => {
      const mockUpsert = jest.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValue({ upsert: mockUpsert });

      await service.registerToken('user-1', 'ExponentPushToken[abc123]');

      expect(mockFrom).toHaveBeenCalledWith('push_tokens');
      expect(mockUpsert).toHaveBeenCalledWith(
        { user_id: 'user-1', expo_push_token: 'ExponentPushToken[abc123]' },
        { onConflict: 'expo_push_token' },
      );
    });

    it('throws on supabase error', async () => {
      mockFrom.mockReturnValue({
        upsert: () => ({ error: { message: 'Upsert failed' } }),
      });

      await expect(
        service.registerToken('user-1', 'ExponentPushToken[abc]'),
      ).rejects.toThrow('Upsert failed');
    });
  });

  describe('unregisterToken', () => {
    it('deletes push token for the user', async () => {
      const mockEqToken = jest.fn().mockReturnValue({ error: null });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqToken });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqUser });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await service.unregisterToken('user-1', 'ExponentPushToken[abc123]');

      expect(mockFrom).toHaveBeenCalledWith('push_tokens');
      expect(mockEqUser).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockEqToken).toHaveBeenCalledWith(
        'expo_push_token',
        'ExponentPushToken[abc123]',
      );
    });

    it('throws on supabase error', async () => {
      const mockEqToken = jest
        .fn()
        .mockReturnValue({ error: { message: 'Delete failed' } });
      const mockEqUser = jest.fn().mockReturnValue({ eq: mockEqToken });
      mockFrom.mockReturnValue({
        delete: () => ({ eq: mockEqUser }),
      });

      await expect(
        service.unregisterToken('user-1', 'ExponentPushToken[abc]'),
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('sendToHousehold', () => {
    it('sends push notifications to household members excluding the actor', async () => {
      const mockNeq = jest.fn().mockReturnValue({
        data: [{ user_id: 'user-2' }, { user_id: 'user-3' }],
        error: null,
      });
      const mockEqHousehold = jest.fn().mockReturnValue({ neq: mockNeq });
      const mockSelectMembers = jest.fn().mockReturnValue({ eq: mockEqHousehold });

      const mockIn = jest.fn().mockReturnValue({
        data: [
          { expo_push_token: 'ExponentPushToken[token2]' },
          { expo_push_token: 'ExponentPushToken[token3]' },
        ],
        error: null,
      });
      const mockSelectTokens = jest.fn().mockReturnValue({ in: mockIn });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { select: mockSelectMembers };
        return { select: mockSelectTokens };
      });

      await service.sendToHousehold({
        householdId: 'h-1',
        title: 'Fogon',
        body: 'Alice added items to the shopping list',
        excludeUserId: 'user-1',
      });

      expect(mockFrom).toHaveBeenCalledWith('household_members');
      expect(mockFrom).toHaveBeenCalledWith('push_tokens');
      expect(mockEqHousehold).toHaveBeenCalledWith('household_id', 'h-1');
      expect(mockNeq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockIn).toHaveBeenCalledWith('user_id', ['user-2', 'user-3']);
    });

    it('does nothing when no members have tokens', async () => {
      const mockNeq = jest.fn().mockReturnValue({
        data: [{ user_id: 'user-2' }],
        error: null,
      });
      const mockEqHousehold = jest.fn().mockReturnValue({ neq: mockNeq });
      const mockSelectMembers = jest.fn().mockReturnValue({ eq: mockEqHousehold });

      const mockIn = jest.fn().mockReturnValue({
        data: [],
        error: null,
      });
      const mockSelectTokens = jest.fn().mockReturnValue({ in: mockIn });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { select: mockSelectMembers };
        return { select: mockSelectTokens };
      });

      await service.sendToHousehold({
        householdId: 'h-1',
        title: 'Fogon',
        body: 'Test',
        excludeUserId: 'user-1',
      });

      // Should not throw
    });

    it('does nothing when there are no other members', async () => {
      const mockNeq = jest.fn().mockReturnValue({
        data: [],
        error: null,
      });
      const mockEqHousehold = jest.fn().mockReturnValue({ neq: mockNeq });
      const mockSelectMembers = jest.fn().mockReturnValue({ eq: mockEqHousehold });

      mockFrom.mockReturnValue({ select: mockSelectMembers });

      await service.sendToHousehold({
        householdId: 'h-1',
        title: 'Fogon',
        body: 'Test',
        excludeUserId: 'user-1',
      });

      expect(mockFrom).toHaveBeenCalledTimes(1);
    });

    it('handles member query errors gracefully', async () => {
      const mockNeq = jest.fn().mockReturnValue({
        data: null,
        error: { message: 'Query failed' },
      });
      const mockEqHousehold = jest.fn().mockReturnValue({ neq: mockNeq });
      const mockSelectMembers = jest.fn().mockReturnValue({ eq: mockEqHousehold });

      mockFrom.mockReturnValue({ select: mockSelectMembers });

      await service.sendToHousehold({
        householdId: 'h-1',
        title: 'Fogon',
        body: 'Test',
        excludeUserId: 'user-1',
      });
    });
  });
});

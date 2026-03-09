import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingGateway } from './shopping.gateway';
import { SupabaseService } from '../supabase/supabase.service';
import { SHOPPING_EVENTS } from '@fogon/types';
import type { Socket, Server } from 'socket.io';

const mockGetUser = jest.fn();
const mockSelect = jest.fn();

const createMockSupabase = () => ({
  getClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: mockSelect,
          }),
        }),
      }),
    }),
  }),
});

function createMockSocket(overrides: Partial<Socket> = {}): Socket {
  const rooms = new Set<string>();
  return {
    id: 'socket-1',
    handshake: { auth: { token: 'valid-jwt' }, headers: {} },
    data: {},
    rooms,
    join: jest.fn((room: string) => {
      rooms.add(room);
      return Promise.resolve();
    }),
    leave: jest.fn((room: string) => {
      rooms.delete(room);
      return Promise.resolve();
    }),
    emit: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  } as unknown as Socket;
}

describe('ShoppingGateway', () => {
  let gateway: ShoppingGateway;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingGateway,
        { provide: SupabaseService, useFactory: createMockSupabase },
      ],
    }).compile();

    gateway = module.get<ShoppingGateway>(ShoppingGateway);

    // Assign mock server
    const mockEmit = jest.fn();
    const mockExcept = jest.fn().mockReturnValue({ emit: mockEmit });
    const mockTo = jest.fn().mockReturnValue({ emit: mockEmit, except: mockExcept });
    gateway.server = { to: mockTo } as unknown as Server;
  });

  describe('handleConnection', () => {
    it('authenticates client with valid token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const client = createMockSocket();
      await gateway.handleConnection(client);

      expect(client.data).toEqual({ userId: 'user-1' });
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects client with missing token', async () => {
      const client = createMockSocket({
        handshake: { auth: {}, headers: {} } as Socket['handshake'],
      });

      await gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('disconnects client with invalid token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      });

      const client = createMockSocket();
      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('extracts token from Bearer authorization header', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const client = createMockSocket({
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-jwt' },
        } as Socket['handshake'],
      });

      await gateway.handleConnection(client);

      expect(mockGetUser).toHaveBeenCalledWith('header-jwt');
      expect(client.data).toEqual({ userId: 'user-1' });
    });
  });

  describe('handleJoinHousehold', () => {
    it('joins household room when user is a member', async () => {
      mockSelect.mockResolvedValue({ data: { id: 'member-1' }, error: null });

      const client = createMockSocket();
      client.data = { userId: 'user-1' };

      const result = await gateway.handleJoinHousehold(client, {
        householdId: '00000000-0000-0000-0000-000000000001',
      });

      expect(result).toEqual({ success: true });
      expect(client.join).toHaveBeenCalledWith(
        'household:00000000-0000-0000-0000-000000000001',
      );
    });

    it('rejects invalid household ID format', async () => {
      const client = createMockSocket();
      client.data = { userId: 'user-1' };

      const result = await gateway.handleJoinHousehold(client, {
        householdId: 'invalid-id',
      });

      expect(result).toEqual({
        success: false,
        message: 'Invalid household ID',
      });
      expect(client.join).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated client', async () => {
      const client = createMockSocket();

      const result = await gateway.handleJoinHousehold(client, {
        householdId: '00000000-0000-0000-0000-000000000001',
      });

      expect(result).toEqual({
        success: false,
        message: 'Not authenticated',
      });
    });

    it('rejects non-member of household', async () => {
      mockSelect.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const client = createMockSocket();
      client.data = { userId: 'user-1' };

      const result = await gateway.handleJoinHousehold(client, {
        householdId: '00000000-0000-0000-0000-000000000001',
      });

      expect(result).toEqual({
        success: false,
        message: 'Not a member of this household',
      });
    });

    it('leaves previous household room before joining new one', async () => {
      mockSelect.mockResolvedValue({ data: { id: 'member-1' }, error: null });

      const client = createMockSocket();
      client.data = { userId: 'user-1' };
      client.rooms.add('household:old-household-id-00000000');

      await gateway.handleJoinHousehold(client, {
        householdId: '00000000-0000-0000-0000-000000000001',
      });

      expect(client.leave).toHaveBeenCalledWith('household:old-household-id-00000000');
      expect(client.join).toHaveBeenCalledWith(
        'household:00000000-0000-0000-0000-000000000001',
      );
    });
  });

  describe('rate limiting', () => {
    it('disconnects client after exceeding 10 join events per minute', async () => {
      mockSelect.mockResolvedValue({ data: { id: 'member-1' }, error: null });

      const client = createMockSocket();
      client.data = { userId: 'user-1' };

      const payload = { householdId: '00000000-0000-0000-0000-000000000001' };

      // First 10 calls should succeed
      for (let i = 0; i < 10; i++) {
        const result = await gateway.handleJoinHousehold(client, payload);
        expect(result.success).toBe(true);
      }

      // 11th call should be rate limited
      const result = await gateway.handleJoinHousehold(client, payload);

      expect(result).toEqual({ success: false, message: 'Rate limit exceeded' });
      expect(client.emit).toHaveBeenCalledWith('error', { message: 'Rate limit exceeded' });
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('cleans up rate limit entry on disconnect', async () => {
      mockSelect.mockResolvedValue({ data: { id: 'member-1' }, error: null });

      const client = createMockSocket();
      client.data = { userId: 'user-1' };

      const payload = { householdId: '00000000-0000-0000-0000-000000000001' };

      // Use up some rate limit
      for (let i = 0; i < 5; i++) {
        await gateway.handleJoinHousehold(client, payload);
      }

      // Disconnect and reconnect (simulated by clearing data)
      gateway.handleDisconnect(client);

      // After disconnect, rate limit should be reset — 10 more calls should work
      for (let i = 0; i < 10; i++) {
        const result = await gateway.handleJoinHousehold(client, payload);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('emitToHousehold', () => {
    it('should emit event with payload to household room', () => {
      const payload = { householdId: 'h-1', item: 'Tomatoes' };
      gateway.emitToHousehold('h-1', SHOPPING_EVENTS.CREATED, payload);

      expect(gateway.server.to).toHaveBeenCalledWith('household:h-1');
      const toResult = (gateway.server.to as jest.Mock).mock.results[0].value;
      expect(toResult.emit).toHaveBeenCalledWith(SHOPPING_EVENTS.CREATED, payload);
    });

    it('should exclude specific socket and emit event when excludeSocketId provided', () => {
      const payload = { householdId: 'h-1', item: 'Onions' };
      gateway.emitToHousehold(
        'h-1',
        SHOPPING_EVENTS.CREATED,
        payload,
        'socket-to-exclude',
      );

      const toResult = (gateway.server.to as jest.Mock).mock.results[0].value;
      expect(toResult.except).toHaveBeenCalledWith('socket-to-exclude');
      const exceptResult = toResult.except.mock.results[0].value;
      expect(exceptResult.emit).toHaveBeenCalledWith(SHOPPING_EVENTS.CREATED, payload);
    });
  });
});

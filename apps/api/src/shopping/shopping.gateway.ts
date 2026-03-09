import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SupabaseService } from '../supabase/supabase.service';
import { SHOPPING_EVENTS } from '@fogon/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function householdRoom(householdId: string): string {
  return `household:${householdId}`;
}

@WebSocketGateway({
  cors: {
    origin: [/^https?:\/\/localhost(:\d+)?$/, /fogon\.app$/],
    credentials: true,
  },
  namespace: '/shopping',
})
export class ShoppingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ShoppingGateway.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('Missing authorization token');
      }

      const supabase = this.supabaseService.getClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      client.data = { userId: user.id };
      this.logger.log(`Client connected: ${client.id} (user: ${user.id})`);
    } catch {
      this.logger.warn(`Client rejected: ${client.id}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SHOPPING_EVENTS.JOIN_HOUSEHOLD)
  async handleJoinHousehold(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { householdId: string },
  ): Promise<{ success: boolean; message?: string }> {
    const userId: string | undefined = client.data?.userId;
    const { householdId } = payload;

    if (!householdId || !UUID_RE.test(householdId)) {
      return { success: false, message: 'Invalid household ID' };
    }

    if (!userId) {
      return { success: false, message: 'Not authenticated' };
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('household_members')
      .select('id')
      .eq('household_id', householdId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { success: false, message: 'Not a member of this household' };
    }

    // Leave any previous household rooms
    for (const room of client.rooms) {
      if (room.startsWith('household:') && room !== householdRoom(householdId)) {
        await client.leave(room);
      }
    }

    await client.join(householdRoom(householdId));
    this.logger.log(`User ${userId} joined room ${householdRoom(householdId)}`);

    return { success: true };
  }

  emitToHousehold(
    householdId: string,
    event: string,
    payload: Record<string, unknown>,
    excludeSocketId?: string,
  ): void {
    const room = householdRoom(householdId);

    if (excludeSocketId) {
      this.server.to(room).except(excludeSocketId).emit(event, payload);
    } else {
      this.server.to(room).emit(event, payload);
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader: string | undefined =
      client.handshake?.auth?.token ?? client.handshake?.headers?.authorization;

    if (!authHeader) return undefined;

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return authHeader;
  }
}

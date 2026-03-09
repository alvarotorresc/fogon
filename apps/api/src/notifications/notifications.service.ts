import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { SupabaseService } from '../supabase/supabase.service';

interface HouseholdNotification {
  householdId: string;
  title: string;
  body: string;
  excludeUserId: string;
}

@Injectable()
export class NotificationsService {
  private readonly supabase: SupabaseClient;
  private readonly expo: Expo;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
    this.expo = new Expo();
  }

  async registerToken(userId: string, token: string): Promise<void> {
    const { error } = await this.supabase.from('push_tokens').upsert(
      { user_id: userId, expo_push_token: token },
      { onConflict: 'expo_push_token' },
    );

    if (error) throw new Error(error.message);
  }

  async unregisterToken(userId: string, token: string): Promise<void> {
    const { error } = await this.supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('expo_push_token', token);

    if (error) throw new Error(error.message);
  }

  async sendToHousehold(notification: HouseholdNotification): Promise<void> {
    const tokens = await this.getHouseholdTokens(
      notification.householdId,
      notification.excludeUserId,
    );

    if (tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens
      .filter((token) => Expo.isExpoPushToken(token))
      .map((token) => ({
        to: token,
        sound: 'default' as const,
        title: notification.title,
        body: notification.body,
      }));

    if (messages.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const tickets: ExpoPushTicket[] = await this.expo.sendPushNotificationsAsync(chunk);

        for (const ticket of tickets) {
          if (ticket.status === 'error') {
            this.logger.warn(`Push notification error: ${ticket.message}`, {
              details: ticket.details,
            });
          }
        }
      } catch (error) {
        this.logger.error('Failed to send push notification chunk', error);
      }
    }
  }

  private async getHouseholdTokens(
    householdId: string,
    excludeUserId: string,
  ): Promise<string[]> {
    const { data: members, error: membersError } = await this.supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdId)
      .neq('user_id', excludeUserId);

    if (membersError || !members || members.length === 0) return [];

    const userIds = members.map((m) => m.user_id as string);

    const { data: tokens, error: tokensError } = await this.supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('user_id', userIds);

    if (tokensError || !tokens) return [];

    return tokens.map((t) => t.expo_push_token as string);
  }
}

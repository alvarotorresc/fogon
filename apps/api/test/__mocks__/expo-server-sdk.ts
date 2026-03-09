export class Expo {
  static isExpoPushToken(_token: string): boolean {
    return true;
  }

  sendPushNotificationsAsync(_messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
    return Promise.resolve([]);
  }
}

export interface ExpoPushMessage {
  to: string | string[];
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
}

export default Expo;

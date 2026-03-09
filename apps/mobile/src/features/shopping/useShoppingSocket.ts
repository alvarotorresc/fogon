import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import { SHOPPING_EVENTS } from '@fogon/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const QUERY_KEY = 'shopping_items';

export function useShoppingSocket(): void {
  const { household } = useHouseholdStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!household) return;

    let cancelled = false;

    async function connect() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.access_token) return;

      const socket = io(`${API_URL}/shopping`, {
        auth: { token: session.access_token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit(SHOPPING_EVENTS.JOIN_HOUSEHOLD, {
          householdId: household!.id,
        });
      });

      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      };

      socket.on(SHOPPING_EVENTS.CREATED, invalidate);
      socket.on(SHOPPING_EVENTS.TOGGLED, invalidate);
      socket.on(SHOPPING_EVENTS.UPDATED, invalidate);
      socket.on(SHOPPING_EVENTS.DELETED, invalidate);
      socket.on(SHOPPING_EVENTS.CLEARED, invalidate);
    }

    connect();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [household?.id, queryClient]);
}

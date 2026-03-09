import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/** Syncs NetInfo with react-query onlineManager and exposes connection status. */
export function useNetworkStatus(): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      onlineManager.setOnline(connected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
}

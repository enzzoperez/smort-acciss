import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';

type NetworkContextType = {
  isOnline: boolean;
  isSyncing: boolean;
};

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSyncing: false,
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const { sync, isSyncing } = useSyncOfflineData();

  const [isOnline, setIsOnline] = useState(true);

  const previousOnline = useRef<boolean | null>(null);

  const updateState = async () => {
    const state = await NetInfo.fetch();

    const online = Boolean(state.isConnected);

    if (previousOnline.current === null) {
      previousOnline.current = online;
      setIsOnline(online);
      return;
    }

    if (previousOnline.current !== online) {
      previousOnline.current = online;
      setIsOnline(online);

      if (online) {
        trackEvent(TrackingEvents.NETWORK_CONNECTION_RESTORED);
        sync();
      } else {
        trackEvent(TrackingEvents.NETWORK_CONNECTION_LOST);
      }
    }
  };

  // updateState (y el sync que llama) se recrean en cada render con los valores
  // frescos de db/scanAccess, pero el listener/interval de abajo se registran una
  // sola vez al montar. Guardamos la ultima version en un ref para que siempre
  // llamen a la version actualizada en vez de quedar con la del primer render.
  const updateStateRef = useRef(updateState);
  useEffect(() => {
    updateStateRef.current = updateState;
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(() => {
      updateStateRef.current();
    });

    updateStateRef.current();

    const interval = setInterval(() => updateStateRef.current(), 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isSyncing }}>{children}</NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

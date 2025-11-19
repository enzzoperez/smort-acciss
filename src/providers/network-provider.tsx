import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';

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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected);
      const reachable = state.isInternetReachable ?? connected;

      setIsOnline(connected && reachable);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOnline) {
      Alert.alert(
        'Sin conexión Provider',
        'Estás en modo offline. Los datos se guardarán localmente y se enviarán al recuperar la conexión.',
      );
    }
  }, [isOnline, sync]);

  return (
    <NetworkContext.Provider value={{ isOnline, isSyncing }}>{children}</NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

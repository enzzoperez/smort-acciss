import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function UpdatesProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (__DEV__) return;

    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) return;

        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Actualización disponible',
          'Hay una nueva versión lista. Reiniciá la app para aplicarla.',
          [
            { text: 'Después', style: 'cancel' },
            { text: 'Reiniciar', onPress: () => Updates.reloadAsync() },
          ],
        );
      } catch {
        // Sin red o sin servidor de updates: continuar con el bundle embebido.
      }
    })();
  }, []);

  return children;
}

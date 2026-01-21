import { useCallback } from 'react';
import { useSyncOfflineDataMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { clearOfflineQueue, getOfflineQrList } from '@/db/utils';

export const useSyncOfflineData = () => {
  const [triggerSync, { isLoading, isError, error }] = useSyncOfflineDataMutation();
  const { selectedEvent } = useAppSelector((state) => state.config);

  const sync = useCallback(async () => {
    try {
      const pendingList = await getOfflineQrList();

      if (!pendingList || pendingList.length === 0) {
        return;
      }

      await triggerSync({ eventCode: selectedEvent as string, qrCodes: pendingList }).unwrap();

      await clearOfflineQueue();
    } catch (err) {
      console.error('Falló la sincronización offline:', err);
    }
  }, [triggerSync, selectedEvent]);

  return {
    sync,
    isSyncing: isLoading,
    error: isError ? error : null,
  };
};

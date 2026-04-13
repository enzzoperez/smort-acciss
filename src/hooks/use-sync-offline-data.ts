import { useCallback } from 'react';
import { useSyncOfflineDataMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { clearOfflineQueue, getOfflineQrList } from '@/db/utils';
import { useDb } from './use-db';

export const useSyncOfflineData = () => {
  const [triggerSync, { isLoading, isError, error }] = useSyncOfflineDataMutation();
  const { selectedEvent } = useAppSelector((state) => state.config);
  const { db, ready } = useDb();

  const sync = useCallback(async () => {
    try {
      if (!ready || !db) {
        return;
      }

      const pendingList = await getOfflineQrList(db);

      if (!pendingList || pendingList.length === 0) {
        return;
      }

      await triggerSync({ eventCode: selectedEvent as string, qrCodes: pendingList }).unwrap();

      await clearOfflineQueue(db);
    } catch (err) {
      console.error('Falló la sincronización offline:', err);
    }
  }, [triggerSync, selectedEvent, db, ready]);

  return {
    sync,
    isSyncing: isLoading,
    error: isError ? error : null,
  };
};

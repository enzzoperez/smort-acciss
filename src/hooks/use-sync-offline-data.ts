import { useCallback } from 'react';
import { useSyncOfflineDataMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { clearOfflineQueue, getOfflineQrList } from '@/db/utils';
import { useDb } from './use-db';
import { logMessage } from '@/libs/crashlytics';

export const useSyncOfflineData = () => {
  const [triggerSync, { isLoading, isError, error }] = useSyncOfflineDataMutation();
  const { selectedEvent } = useAppSelector((state) => state.config);
  const { db, ready } = useDb();

  const sync = useCallback(async (): Promise<boolean | undefined> => {
    try {
      if (!ready || !db) {
        return false;
      }

      if (!isLoading) {
        const pendingList = await getOfflineQrList(db);

        if (!pendingList || pendingList.length === 0) {
          return true;
        }

        logMessage(
          `[offline-sync] pending tickets: ${JSON.stringify({
            eventCode: selectedEvent as string,
            qrCodes: pendingList,
            timestamp: new Date().toISOString(),
          })}`,
        );

        await triggerSync({ eventCode: selectedEvent as string, qrCodes: pendingList }).unwrap();

        await clearOfflineQueue(db);
        return true;
      }
    } catch (err) {
      logMessage(`[offline-sync] error: ${JSON.stringify(err)}`);
      return false;
    }
  }, [triggerSync, selectedEvent, db, ready]);

  return {
    sync,
    isSyncing: isLoading,
    error: isError ? error : null,
  };
};

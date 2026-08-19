import { useCallback } from 'react';
import { useSyncOfflineDataMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { clearOfflineQueue, getOfflineQrList } from '@/db/utils';
import { useDb } from './use-db';
import { logMessage } from '@/libs/crashlytics';

export const useSyncOfflineData = () => {
  const [triggerSync, { isLoading, isError, error }] = useSyncOfflineDataMutation();
  const { scanAccess } = useAppSelector((state) => state.config);
  const { db, ready } = useDb();

  const sync = useCallback(async (): Promise<boolean | undefined> => {
    try {
      if (!ready || !db || !scanAccess) {
        return false;
      }

      if (!isLoading) {
        const pendingList = await getOfflineQrList(db);

        if (!pendingList || pendingList.length === 0) {
          return true;
        }

        logMessage(
          `[offline-sync] pending tickets: ${JSON.stringify({
            pin: scanAccess.config.code,
            qrCodes: pendingList,
            timestamp: new Date().toISOString(),
          })}`,
        );

        await triggerSync({
          pin: scanAccess.config.code,
          observation: scanAccess.observation,
          operatorDocument: scanAccess.operatorDocument,
          qrCodes: pendingList,
        }).unwrap();

        await clearOfflineQueue(db);
        return true;
      }
    } catch (err) {
      logMessage(`[offline-sync] error: ${JSON.stringify(err)}`);
      return false;
    }
  }, [triggerSync, scanAccess, db, ready]);

  return {
    sync,
    isSyncing: isLoading,
    error: isError ? error : null,
  };
};

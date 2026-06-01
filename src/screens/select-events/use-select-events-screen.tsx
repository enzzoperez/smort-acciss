import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useLogoutMutation } from '@/api/auth-api';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import {
  resetUserData,
  setConfigEventQr,
  setLogout,
  setSelectedEvent,
  setSelectedEventConfig,
  setServerOffset,
  setVerifyOnly,
  setResetConfig,
  setAvailableEvents,
  setTotalAssigned,
} from '@/store/slices';
import { useGetEventQrConfigMutation, useGetEventsQuery, EventData } from '@/api/events-api';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { logError } from '@/libs/crashlytics';
import { clearAllData, syncTicketsForEvent } from '@/db/utils';
import { useDb } from '@/hooks/use-db';
import { getEventSync, resetAllEventSync } from '@/db/repositories/events-sync.repository';
import { countTickets } from '@/db/repositories/tickets.repository';

function getValidEventIds(event: EventData): string[] {
  if (event.type === 'ALIAS') {
    return event.item?.map((i) => i.eventCode) ?? [];
  }
  return [event.eventCode];
}

async function aggregateSyncState(
  event: EventData,
  db: NonNullable<ReturnType<typeof useDb>['db']>,
  accountId: string,
): Promise<{ hasTicketsDownloaded: boolean; lastSyncDate: string | null }> {
  const ids = getValidEventIds(event);
  const records = await Promise.all(ids.map((id) => getEventSync(db, id, accountId)));
  const allDone = records.every((r) => r?.initialSyncDone === 1);
  const dates = records.map((r) => r?.lastSyncDate).filter(Boolean) as string[];
  const oldest = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : null;
  return { hasTicketsDownloaded: allDone, lastSyncDate: oldest };
}

export function useSelectEventsScreen() {
  const router = useRouter();
  const { sync } = useSyncOfflineData();
  const { userData } = useAppSelector((state) => state.user);
  const { selectedEvent, selectedEventConfig, availableEvents } = useAppSelector(
    (state) => state.config,
  );
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();
  const [logout] = useLogoutMutation();
  const {
    data: dataEvents,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetEventsQuery(undefined, { skip: !isOnline, refetchOnMountOrArgChange: isOnline });
  const [getQrConfig] = useGetEventQrConfigMutation();
  const { db } = useDb();

  const [itemSelected, setItemSelected] = useState<EventData | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [hasTicketsDownloaded, setHasTicketsDownloaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastProcessedEventCode = useRef<string | null>(null);

  const isDisabledButton =
    !selectedEvent || isLoading || isFetching || (!isOnline && !hasTicketsDownloaded);

  const calculateServerOffset = (serverTime: string | undefined) => {
    if (serverTime) {
      const serverNow = new Date(serverTime).getTime();
      dispatch(setServerOffset(serverNow - Date.now()));
    }
  };

  const saveQrConfig = async (eventCode: string) => {
    try {
      const data = await getQrConfig({ eventCode }).unwrap();
      if (data?.length) {
        calculateServerOffset(data[0]?.serverTime);
        dispatch(setConfigEventQr(data));
      }
    } catch (error) {
      logError(error as Error);
    }
  };

  const closeSession = async () => {
    const synced = await sync();
    if (!synced) {
      Alert.alert(
        'No se pudo cerrar sesión',
        'Hay escaneos pendientes de sincronizar. Por favor revisá tu conexión e intentá nuevamente en un rato.',
      );
      return;
    }
    logout({ accountId: userData?.accountId });
    dispatch(setLogout());
    dispatch(resetUserData());
    dispatch(setSelectedEvent(null));
    dispatch(setResetConfig());
    if (db) {
      resetAllEventSync(db);
      clearAllData(db);
    }
  };

  const onRefresh = async () => {
    if (isOnline) {
      refetch();
    }

    if (isOnline && selectedEventConfig && db && userData?.accountId) {
      const validIds = getValidEventIds(selectedEventConfig);
      for (const id of validIds) {
        await syncTicketsForEvent({ eventId: id, db, isOnline, accountId: userData.accountId });
      }
      dispatch(setTotalAssigned(await countTickets(db, validIds)));
    }

    if (selectedEventConfig && db && userData?.accountId) {
      const state = await aggregateSyncState(selectedEventConfig, db, userData.accountId);
      setLastSyncDate(state.lastSyncDate);
      setHasTicketsDownloaded(state.hasTicketsDownloaded);
    }
  };

  const onChangeSelectedEvent = (item: EventData) => {
    setItemSelected(item);
  };

  const handleDownload = async () => {
    if (!selectedEventConfig || !db || !userData?.accountId) return;
    setIsSyncing(true);
    try {
      const validIds = getValidEventIds(selectedEventConfig);
      for (const id of validIds) {
        await syncTicketsForEvent({ eventId: id, db, isOnline, accountId: userData.accountId });
      }
      dispatch(setTotalAssigned(await countTickets(db, validIds)));
      const state = await aggregateSyncState(selectedEventConfig, db, userData.accountId);
      setLastSyncDate(state.lastSyncDate);
      setHasTicketsDownloaded(state.hasTicketsDownloaded);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScanButton = async () => {
    if (isOnline && selectedEventConfig && db && userData?.accountId) {
      setIsSyncing(true);
      const validIds = getValidEventIds(selectedEventConfig);
      for (const id of validIds) {
        await syncTicketsForEvent({ eventId: id, db, isOnline, accountId: userData.accountId });
      }
      dispatch(setTotalAssigned(await countTickets(db, validIds)));
      setIsSyncing(false);
    }
    router.push('/camera');
  };

  // Restore previously selected event when returning to this screen
  useEffect(() => {
    if (selectedEvent && dataEvents) {
      const selected = dataEvents.config.find((event) => event.eventCode === selectedEvent);
      setItemSelected(selected ?? null);
    } else if (selectedEvent && selectedEventConfig) {
      setItemSelected(selectedEventConfig);
    }
  }, []);

  // Sync tickets and QR config whenever the selected event changes
  useEffect(() => {
    const handleSelectedEventChange = async () => {
      const eventsConfig = dataEvents?.config ?? availableEvents;
      if (!itemSelected || eventsConfig.length === 0 || !db) return;

      // Skip if this event was already processed — prevents double-sync on pull-to-refresh
      if (itemSelected.eventCode === lastProcessedEventCode.current) return;

      const selected = eventsConfig.find((event) => event.eventCode === itemSelected.eventCode);
      if (!selected) return;

      const accountId = userData?.accountId ?? '';
      const validIds = getValidEventIds(selected);

      // Check all sub-events are downloaded (for ALIAS: all must be done)
      const syncRecords = await Promise.all(validIds.map((id) => getEventSync(db, id, accountId)));
      const alreadyDownloaded = syncRecords.every((s) => s?.initialSyncDone === 1);

      if (!isOnline && !alreadyDownloaded) {
        Alert.alert(
          'Evento seleccionado',
          'No se pudo conectar a internet para la descarga de tickets del evento seleccionado. Por favor revisa tu conexión e inténtalo de nuevo.',
        );
        lastProcessedEventCode.current = null;
        setItemSelected(null);
        dispatch(setSelectedEvent(null));
        setHasTicketsDownloaded(false);
        return;
      }

      try {
        setIsSyncing(true);
        for (const id of validIds) {
          await syncTicketsForEvent({ eventId: id, db, isOnline, accountId });
        }
        await saveQrConfig(selected.eventCode);
        dispatch(setTotalAssigned(await countTickets(db, validIds)));

        lastProcessedEventCode.current = selected.eventCode;
        setItemSelected(selected);
        dispatch(setSelectedEvent(selected.eventCode));
        dispatch(setSelectedEventConfig(selected));
        dispatch(setVerifyOnly(selected.mode === 'CHECK'));
      } catch {
        lastProcessedEventCode.current = null;
        setItemSelected(null);
        Alert.alert(
          'Error al sincronizar',
          'No se pudieron descargar los tickets del evento. Por favor intentá de nuevo.',
        );
      } finally {
        setIsSyncing(false);
      }
    };

    handleSelectedEventChange();
  }, [itemSelected, dataEvents, availableEvents, db]);

  // Keep itemSelected display data fresh when dataEvents refreshes (sections, mode, etc.)
  useEffect(() => {
    if (!itemSelected || !dataEvents?.config) return;
    const updated = dataEvents.config.find((e) => e.eventCode === itemSelected.eventCode);
    if (updated) setItemSelected(updated);
  }, [dataEvents]);

  // Auto-select event if only one is assigned to the user
  useEffect(() => {
    try {
      if (dataEvents?.config) {
        dispatch(setAvailableEvents(dataEvents.config));
      }
      if (dataEvents?.config.length === 1) {
        setItemSelected(dataEvents.config[0]);
        dispatch(setSelectedEventConfig(dataEvents.config[0]));
        dispatch(setSelectedEvent(dataEvents.config[0].eventCode));
        dispatch(setVerifyOnly(dataEvents.config[0].mode === 'CHECK'));
      }
    } catch (error) {
      logError(error as Error);
    }
  }, [dataEvents]);

  // Sync offline scanned data when the connection is recovered
  useEffect(() => {
    if (isOnline && selectedEvent && db) {
      sync();
    }
  }, [isOnline]);

  // Load last sync date and download status each time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!db || !selectedEventConfig || !userData?.accountId) return;
      aggregateSyncState(selectedEventConfig, db, userData.accountId).then((state) => {
        setLastSyncDate(state.lastSyncDate);
        setHasTicketsDownloaded(state.hasTicketsDownloaded);
      });
    }, [db, selectedEventConfig, userData?.accountId]),
  );

  return {
    dataEvents,
    availableEvents,
    selectedEvent,
    itemSelected,
    lastSyncDate,
    isOnline,
    isLoading,
    isFetching,
    isError,
    isSyncing,
    isDisabledButton,
    onChangeSelectedEvent,
    handleScanButton,
    handleDownload,
    onRefresh,
    closeSession,
  };
}

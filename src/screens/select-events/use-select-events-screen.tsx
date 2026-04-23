import { useCallback, useEffect, useState } from 'react';
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
} from '@/store/slices';
import { useGetEventQrConfigMutation, useGetEventsQuery, EventData } from '@/api/events-api';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { logError } from '@/libs/crashlytics';
import { clearAllData, syncTicketsForEvent } from '@/db/utils';
import { useDb } from '@/hooks/use-db';
import { getEventSync, resetAllEventSync } from '@/db/repositories/events-sync.repository';

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
      if (data?.length === 1) {
        calculateServerOffset(data[0]?.serverTime);
        dispatch(setConfigEventQr(data[0]));
      } else if (data?.length && data.length > 1) {
        const configObject = data.find((config) => config.code === eventCode);
        calculateServerOffset(configObject?.serverTime);
        dispatch(setConfigEventQr(configObject!));
      }
    } catch (error) {
      logError(error as Error);
    }
  };

  const closeSession = () => {
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
    if (!isOnline) {
      refetch();
      if (selectedEvent && db && userData?.accountId) {
        await syncTicketsForEvent({
          eventId: selectedEvent,
          db,
          isOnline,
          accountId: userData.accountId,
        });
        getEventSync(db, selectedEvent, userData.accountId).then((eventSync) => {
          setLastSyncDate(eventSync?.lastSyncDate ?? null);
          setHasTicketsDownloaded(eventSync?.initialSyncDone === 1);
        });
      }
    }
  };

  const onChangeSelectedEvent = (item: EventData) => {
    setItemSelected(item);
  };

  const handleScanButton = async () => {
    if (isOnline && selectedEvent && db && userData?.accountId) {
      setIsSyncing(true);
      await syncTicketsForEvent({
        eventId: selectedEvent,
        db,
        isOnline,
        accountId: userData.accountId,
      });
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

      const selected = eventsConfig.find((event) => event.eventCode === itemSelected.eventCode);
      if (!selected) return;

      const accountId = userData?.accountId ?? '';
      const eventSync = await getEventSync(db, itemSelected.eventCode, accountId);
      const alreadyDownloaded = eventSync?.initialSyncDone === 1;

      if (!isOnline && !alreadyDownloaded) {
        Alert.alert(
          'Evento seleccionado',
          'No se pudo conectar a internet para la descarga de tickets del evento seleccionado. Por favor revisa tu conexión e inténtalo de nuevo.',
        );
        setItemSelected(null);
        dispatch(setSelectedEvent(null));
        setHasTicketsDownloaded(false);
        return;
      }

      try {
        setIsSyncing(true);
        await syncTicketsForEvent({ eventId: itemSelected.eventCode, db, isOnline, accountId });
        await saveQrConfig(selected.eventCode);

        setItemSelected(selected);
        dispatch(setSelectedEvent(selected.eventCode));
        dispatch(setSelectedEventConfig(selected));
        dispatch(setVerifyOnly(selected.mode === 'CHECK'));
      } catch {
        setItemSelected(null);
      } finally {
        setIsSyncing(false);
      }
    };

    handleSelectedEventChange();
  }, [itemSelected, dataEvents, availableEvents, db]);

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
      if (!db || !selectedEvent || !userData?.accountId) return;
      getEventSync(db, selectedEvent, userData.accountId).then((eventSync) => {
        setLastSyncDate(eventSync?.lastSyncDate ?? null);
        setHasTicketsDownloaded(eventSync?.initialSyncDone === 1);
      });
    }, [db, selectedEvent, userData?.accountId]),
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
    onRefresh,
    closeSession,
  };
}

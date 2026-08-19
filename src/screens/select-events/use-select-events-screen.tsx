import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { useNetwork } from '@/providers/network-provider';
import { useGetEventQrConfigByCodeMutation, useGetEventQrConfigMutation } from '@/api/events-api';
import {
  setConfigEventQr,
  setLastSyncDate,
  setResetConfig,
  setScanAccess,
  setServerOffset,
  setTotalAssigned,
} from '@/store/slices';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { useDb } from '@/hooks/use-db';
import { clearAllData, syncIssuedTicketsForAccess } from '@/db/utils';
import { countTickets } from '@/db/repositories/tickets.repository';
import { getValidEventIds, getValidSections } from '@/utils/scan-access';

const ASSIGNMENTS_PREVIEW = 4;

export function useSelectEventsScreen() {
  const router = useRouter();
  const { isOnline } = useNetwork();
  const { db } = useDb();
  const { scanAccess, lastSyncDate } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [isLoadingConfiguration, setIsLoadingConfiguration] = useState(false);
  const [getEventQrConfig] = useGetEventQrConfigMutation();
  const [getEventQrConfigByCode] = useGetEventQrConfigByCodeMutation();
  const { apiErrorHandler } = useApiErrorHandler();
  const loadedQrConfigKeyRef = useRef<string | null>(null);
  const config = scanAccess?.config ?? null;
  const operatorDocument = scanAccess?.operatorDocument ?? null;
  const observation = scanAccess?.observation ?? null;
  const items = config?.items ?? [];
  const mode = config?.mode ?? null;
  const issuedTicketsSyncEnabled = config?.issuedTicketsSyncEnabled ?? false;
  const qrConfigKey = config
    ? `${config.id}:${items.map((item) => item.eventCode).join(',')}`
    : null;

  const totalAssignments = useMemo(
    () => items.reduce((total, event) => total + event.sections.length, 0),
    [items],
  );

  const eventsWithPreview = useMemo(
    () =>
      items.map((event) => {
        const isExpanded = !!expandedEvents[event.eventCode];
        const hiddenCount = event.sections.length - ASSIGNMENTS_PREVIEW;
        return {
          ...event,
          visibleSections: isExpanded
            ? event.sections
            : event.sections.slice(0, ASSIGNMENTS_PREVIEW),
          hiddenCount: hiddenCount > 0 ? hiddenCount : 0,
          isExpanded,
        };
      }),
    [items, expandedEvents],
  );

  const loadQrConfigs = useCallback(
    async (configItems: typeof items, clearCurrentConfig: boolean) => {
      if (clearCurrentConfig) {
        dispatch(setConfigEventQr([]));
      }

      const responses = await Promise.all(
        configItems.map(({ eventCode }) => getEventQrConfig({ eventCode }).unwrap()),
      );
      const qrConfigs = responses.flat();

      dispatch(setConfigEventQr(qrConfigs));

      const serverTime = qrConfigs[0]?.serverTime;
      if (serverTime) {
        dispatch(setServerOffset(new Date(serverTime).getTime() - Date.now()));
      }
    },
    [dispatch, getEventQrConfig],
  );

  useEffect(() => {
    if (!qrConfigKey || !isOnline || loadedQrConfigKeyRef.current === qrConfigKey) return;

    const loadInitialQrConfigs = async () => {
      try {
        loadedQrConfigKeyRef.current = qrConfigKey;
        setIsLoadingConfiguration(true);
        const [, syncedAt] = await Promise.all([
          loadQrConfigs(items, true),
          issuedTicketsSyncEnabled && config && db
            ? syncIssuedTicketsForAccess({ pin: config.pin, db, isOnline })
            : Promise.resolve(null),
        ]);

        if (syncedAt) {
          dispatch(setLastSyncDate(syncedAt));
        }

        if (db) {
          dispatch(
            setTotalAssigned(
              await countTickets(db, getValidEventIds(items), getValidSections(items)),
            ),
          );
        }
      } catch (error) {
        loadedQrConfigKeyRef.current = null;
        dispatch(setConfigEventQr([]));
        apiErrorHandler(error);
      } finally {
        setIsLoadingConfiguration(false);
      }
    };

    loadInitialQrConfigs();
  }, [
    qrConfigKey,
    isOnline,
    items,
    loadQrConfigs,
    dispatch,
    apiErrorHandler,
    issuedTicketsSyncEnabled,
    config,
    db,
  ]);

  const onRefresh = async () => {
    if (!config || !isOnline || isLoadingConfiguration) return;

    try {
      setIsLoadingConfiguration(true);
      const refreshedConfig = await getEventQrConfigByCode(config.pin).unwrap();

      const [, syncedAt] = await Promise.all([
        loadQrConfigs(refreshedConfig.items, false),
        refreshedConfig.issuedTicketsSyncEnabled && db
          ? syncIssuedTicketsForAccess({ pin: refreshedConfig.pin, db, isOnline })
          : Promise.resolve(null),
      ]);

      if (syncedAt) {
        dispatch(setLastSyncDate(syncedAt));
      }

      if (db) {
        dispatch(
          setTotalAssigned(
            await countTickets(
              db,
              getValidEventIds(refreshedConfig.items),
              getValidSections(refreshedConfig.items),
            ),
          ),
        );
      }

      const refreshedQrConfigKey = `${refreshedConfig.id}:${refreshedConfig.items
        .map((item) => item.eventCode)
        .join(',')}`;
      loadedQrConfigKeyRef.current = refreshedQrConfigKey;

      dispatch(
        setScanAccess({
          config: refreshedConfig,
          operatorDocument: operatorDocument ?? '',
          observation: observation ?? '',
        }),
      );
    } catch (error) {
      apiErrorHandler(error);
    } finally {
      setIsLoadingConfiguration(false);
    }
  };

  const handleScanQr = () => router.push('/camera');

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          if (db) {
            await clearAllData(db);
          }
          dispatch(setResetConfig());
          router.replace('/');
        },
      },
    ]);
  };

  const toggleEventSections = (eventCode: string) =>
    setExpandedEvents((current) => ({ ...current, [eventCode]: !current[eventCode] }));

  return {
    config,
    operatorDocument,
    observation,
    totalEvents: items.length,
    totalAssignments,
    eventsWithPreview,
    mode,
    issuedTicketsSyncEnabled,
    isLoadingConfiguration,
    isOnline,
    lastSyncDate,
    toggleEventSections,
    onRefresh,
    handleScanQr,
    handleLogout,
  };
}

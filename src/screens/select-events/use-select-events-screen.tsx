import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { clearAllData, hasPendingOfflineTickets, syncIssuedTicketsForAccess } from '@/db/utils';
import { countTickets } from '@/db/repositories/tickets.repository';
import { getValidEventIds, getValidSections } from '@/utils/scan-access';
import { isPinDisabledError } from '@/utils/api-errors';

const ASSIGNMENTS_PREVIEW = 4;

export function useSelectEventsScreen() {
  const router = useRouter();
  const { isOnline } = useNetwork();
  const { db } = useDb();
  const { sync } = useSyncOfflineData();
  const { scanAccess, lastSyncDate } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [isLoadingConfiguration, setIsLoadingConfiguration] = useState(false);
  const [getEventQrConfig] = useGetEventQrConfigMutation();
  const [getEventQrConfigByCode] = useGetEventQrConfigByCodeMutation();
  const { apiErrorHandler } = useApiErrorHandler();
  const loadedQrConfigKeyRef = useRef<string | null>(null);
  const isFetchingConfigRef = useRef(false);
  const hasFocusedOnceRef = useRef(false);
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
        configItems
          .filter(({ source }) => source !== 'SMARTPASS')
          .map(({ eventCode }) => getEventQrConfig({ eventCode }).unwrap()),
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

  const refreshConfig = useCallback(async () => {
    if (!config || !isOnline || isFetchingConfigRef.current) return;

    isFetchingConfigRef.current = true;
    try {
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
      if (isPinDisabledError(error)) {
        const pendingTickets = db ? await hasPendingOfflineTickets(db) : false;
        if (pendingTickets) {
          Alert.alert(
            'No se pudo cerrar la sesión',
            'El pin fue deshabilitado, pero hay tickets pendientes de sincronizar. Una vez sincronizados, se podra cerrar la sesión.',
          );
        } else {
          dispatch(setResetConfig());
          apiErrorHandler(error);
          router.replace('/');
        }
      } else {
        apiErrorHandler(error);
      }
    } finally {
      isFetchingConfigRef.current = false;
    }
  }, [config, isOnline, db, operatorDocument, observation]);

  const onRefresh = async () => {
    if (!config || !isOnline || isLoadingConfiguration) return;
    setIsLoadingConfiguration(true);
    await refreshConfig();
    setIsLoadingConfiguration(false);
  };

  const handleScanQr = () => {
    if (!isOnline && !issuedTicketsSyncEnabled) {
      Alert.alert(
        'No se puede escanear',
        'La descarga de tickets no está habilitada, para poder escanear sin conexión por favor contacta al administrador para habilitarla.',
      );
      return;
    }
    router.push('/camera');
  };

  const performLogout = useCallback(async () => {
    if (db) {
      await clearAllData(db);
    }
    dispatch(setResetConfig());
    router.replace('/');
  }, [db, dispatch, router]);

  const handleLogout = async () => {
    if (db) {
      const pendingTickets = await hasPendingOfflineTickets(db);
      if (pendingTickets) {
        Alert.alert(
          'Tickets pendientes',
          'Hay tickets escaneados pendientes de sincronizar. Envíalos para poder cerrar sesión.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Enviar tickets',
              onPress: async () => {
                try {
                  const synced = await sync();
                  if (!synced) {
                    Alert.alert(
                      'Error',
                      'No se pudieron enviar los tickets pendientes. Revisá tu conexión e intentá nuevamente.',
                    );
                    return;
                  }
                  Alert.alert(
                    'Tickets enviados',
                    'Los tickets pendientes se sincronizaron correctamente. Se cerrará la sesión.',
                    [{ text: 'OK', onPress: () => void performLogout() }],
                  );
                } catch (error) {
                  apiErrorHandler(error);
                }
              },
            },
          ],
        );
        return;
      }
    }

    Alert.alert(
      'Editar pin de configuración',
      '¿Seguro desea editar el pin de configuración?, si lo hace se perderá la configuración actual y deberá ingresar nuevamente un pin.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Si, editar',
          style: 'destructive',
          onPress: () => void performLogout(),
        },
      ],
    );
  };

  const toggleEventSections = (eventCode: string) =>
    setExpandedEvents((current) => ({ ...current, [eventCode]: !current[eventCode] }));

  const isScanDisabled = useMemo(() => {
    return isLoadingConfiguration || !config;
  }, [isLoadingConfiguration, config]);

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

  // Al volver a esta pantalla desde otra (camara, resultado), refrescamos la config
  // en silencio para reflejar cambios hechos del lado del servidor. El mount inicial
  // ya se cubre con el efecto de arriba, por eso se salta el primer focus.
  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return;
      }
      refreshConfigRef.current();
    }, []),
  );

  // refreshConfig cambia de identidad en cada render exitoso (dispatchea un config
  // nuevo), y useFocusEffect vuelve a disparar su callback apenas detecta que cambió
  // de referencia mientras la pantalla sigue enfocada. Por eso guardamos la última
  // versión en un ref y le pasamos a useFocusEffect un callback con deps estables,
  // para que solo reaccione a eventos de foco reales.
  const refreshConfigRef = useRef(refreshConfig);
  useEffect(() => {
    refreshConfigRef.current = refreshConfig;
  }, [refreshConfig]);

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
    isScanDisabled,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { useNetwork } from '@/providers/network-provider';
import { useGetEventQrConfigByCodeMutation, useGetEventQrConfigMutation } from '@/api/events-api';
import { setConfigEventQr, setScanAccess, setServerOffset } from '@/store/slices';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';

const SECTIONS_PREVIEW = 5;

export function useSelectEventsScreen() {
  const { isOnline } = useNetwork();
  const { scanAccess, lastSyncDate } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const [showAllSections, setShowAllSections] = useState(false);
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

  const sections = useMemo(
    () => [...new Set(items.flatMap((event) => event.sections.map((section) => section.code)))],
    [items],
  );

  const visibleSections = showAllSections ? sections : sections.slice(0, SECTIONS_PREVIEW);

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
        await loadQrConfigs(items, true);
      } catch (error) {
        loadedQrConfigKeyRef.current = null;
        dispatch(setConfigEventQr([]));
        apiErrorHandler(error);
      } finally {
        setIsLoadingConfiguration(false);
      }
    };

    loadInitialQrConfigs();
  }, [qrConfigKey, isOnline, items, loadQrConfigs, dispatch, apiErrorHandler]);

  const onRefresh = async () => {
    if (!config || !isOnline || isLoadingConfiguration) return;

    try {
      setIsLoadingConfiguration(true);
      const refreshedConfig = await getEventQrConfigByCode(config.code).unwrap();

      await loadQrConfigs(refreshedConfig.items, false);

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

  return {
    config,
    operatorDocument,
    observation,
    items,
    mode,
    issuedTicketsSyncEnabled,
    isLoadingConfiguration,
    isOnline,
    lastSyncDate,
    showAllSections,
    visibleSections,
    hiddenSections: sections.length - SECTIONS_PREVIEW,
    toggleShowAllSections: () => setShowAllSections((value) => !value),
    onRefresh,
  };
}

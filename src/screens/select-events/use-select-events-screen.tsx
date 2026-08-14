import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { useNetwork } from '@/providers/network-provider';
import { useGetEventQrConfigMutation } from '@/api/events-api';
import { setConfigEventQr, setServerOffset } from '@/store/slices';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';

const SECTIONS_PREVIEW = 5;

export function useSelectEventsScreen() {
  const { isOnline } = useNetwork();
  const { scanAccess, lastSyncDate } = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const [showAllSections, setShowAllSections] = useState(false);
  const [getEventQrConfig, { isLoading: isLoadingQrConfig }] = useGetEventQrConfigMutation();
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

  useEffect(() => {
    if (!qrConfigKey || !isOnline || loadedQrConfigKeyRef.current === qrConfigKey) return;

    const loadQrConfigs = async () => {
      try {
        loadedQrConfigKeyRef.current = qrConfigKey;
        dispatch(setConfigEventQr([]));

        const responses = await Promise.all(
          items.map(({ eventCode }) => getEventQrConfig({ eventCode }).unwrap()),
        );
        const qrConfigs = responses.flat();

        dispatch(setConfigEventQr(qrConfigs));

        const serverTime = qrConfigs[0]?.serverTime;
        if (serverTime) {
          const serverNow = new Date(serverTime).getTime();
          dispatch(setServerOffset(serverNow - Date.now()));
        }
      } catch (error) {
        loadedQrConfigKeyRef.current = null;
        dispatch(setConfigEventQr([]));
        apiErrorHandler(error);
      }
    };

    loadQrConfigs();
  }, [qrConfigKey, isOnline]);

  return {
    config,
    operatorDocument,
    observation,
    items,
    mode,
    issuedTicketsSyncEnabled,
    isLoadingQrConfig,
    isOnline,
    lastSyncDate,
    showAllSections,
    visibleSections,
    hiddenSections: sections.length - SECTIONS_PREVIEW,
    toggleShowAllSections: () => setShowAllSections((value) => !value),
  };
}

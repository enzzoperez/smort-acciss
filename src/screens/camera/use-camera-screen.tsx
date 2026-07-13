import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/libs/redux';
import { setLastSyncDate } from '@/store/slices';
import { useNetwork } from '@/providers/network-provider';
import { useDb } from '@/hooks/use-db';
import { countScannedTicketsByEvent } from '@/db/repositories/valid-tickets.repository';
import { countPendingTickets } from '@/db/repositories/tickets.repository';
import { getEventSync } from '@/db/repositories/events-sync.repository';
import { syncTicketsForEvent } from '@/db/utils';
import { reportError as logError } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { EventData } from '@/api/events-api';

function getValidEventIds(event: EventData): string[] {
  if (event.type === 'ALIAS') {
    return event.item?.map((i) => i.eventCode) ?? [];
  }
  return [event.eventCode];
}

function getValidSections(event: EventData): string[] {
  if (event.type === 'ALIAS') {
    return [...new Set(event.item?.flatMap((i) => i.sections) ?? [])];
  }
  return event.sections ?? [];
}

export function useCameraScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();
  const { db } = useDb();
  const { selectedEventConfig, totalAssigned, selectedEvent, lastSyncDate } = useAppSelector(
    (state) => state.config,
  );
  const { userData } = useAppSelector((state) => state.user);

  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [myScans, setMyScans] = useState(0);
  const [totalPending, setTotalPending] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [infoSheetHeight, setInfoSheetHeight] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!db || !selectedEventConfig) return;
      const validIds = getValidEventIds(selectedEventConfig);
      const sections = getValidSections(selectedEventConfig);
      countScannedTicketsByEvent(db, validIds).then(async (scanCount) => {
        setMyScans(scanCount);
        if (isOnline) {
          setTotalPending(await countPendingTickets(db, validIds, sections));
        } else {
          setTotalPending(totalAssigned != null ? totalAssigned - scanCount : null);
        }
      });
    }, [db, selectedEventConfig, isOnline, totalAssigned]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const handleDownload = async () => {
    if (!selectedEvent || !db || !userData?.accountId) return;
    await syncTicketsForEvent({
      eventId: selectedEvent,
      db,
      isOnline,
      accountId: userData.accountId,
    });
    const sync = await getEventSync(db, selectedEvent, userData.accountId);
    dispatch(setLastSyncDate(sync?.lastSyncDate ?? null));
  };

  const handleScannedCode = ({ data }: { data: string }) => {
    try {
      if (data && !qrLock.current) {
        qrLock.current = true;
        setTimeout(() => {
          router.replace({ pathname: '/scan-result', params: { scannedCode: data } });
        }, 500);
      }
    } catch (error) {
      logError(error);
    }
  };

  const handleToggleTorch = () => {
    const next = !torchEnabled;
    trackEvent(TrackingEvents.FLASHLIGHT_TOGGLED, { flashlight_state: next ? 'on' : 'off' });
    setTorchEnabled(next);
  };

  const handleBack = () => router.back();

  const getEventNameAndDate = (): { name: string; date: string } => {
    const match = selectedEventConfig?.eventName?.match(/^\((.+?)\)\s*(.+)$/);
    return {
      date: match?.[1] ?? 'Fecha no disponible',
      name: match?.[2] ?? selectedEventConfig?.eventName ?? '',
    };
  };
  const { name: eventName, date: eventDateTime } = getEventNameAndDate();

  return {
    torchEnabled,
    myScans,
    totalPending,
    totalAssigned,
    headerHeight,
    setHeaderHeight,
    infoSheetHeight,
    setInfoSheetHeight,
    isOnline,
    lastSyncDate,
    eventName,
    eventDateTime,
    handleDownload,
    handleScannedCode,
    handleToggleTorch,
    handleBack,
  };
}

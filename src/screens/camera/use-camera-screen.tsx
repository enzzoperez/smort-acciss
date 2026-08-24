import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/libs/redux';
import { setScanDirection } from '@/store/slices';
import { useNetwork } from '@/providers/network-provider';
import { useDb } from '@/hooks/use-db';
import { countScannedTicketsByEvent } from '@/db/repositories/valid-tickets.repository';
import { countPendingTickets } from '@/db/repositories/tickets.repository';
import { reportError as logError } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { getValidEventIds, getValidSections } from '@/utils/scan-access';

export function useCameraScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOnline } = useNetwork();
  const { db } = useDb();
  const { scanAccess, totalAssigned, lastSyncDate, direction } = useAppSelector(
    (state) => state.config,
  );
  const items = scanAccess?.config.items ?? [];

  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [myScans, setMyScans] = useState(0);
  const [totalPending, setTotalPending] = useState<number | null>(null);
  const [infoSheetHeight, setInfoSheetHeight] = useState(0);
  const [cameraHeight, setCameraHeight] = useState(0);
  const [cameraWidth, setCameraWidth] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!db || items.length === 0) return;
      const validIds = getValidEventIds(items);
      const sections = getValidSections(items);
      countScannedTicketsByEvent(db, validIds).then(async (scanCount) => {
        setMyScans(scanCount);
        if (isOnline) {
          setTotalPending(await countPendingTickets(db, validIds, sections));
        } else {
          setTotalPending(totalAssigned != null ? totalAssigned - scanCount : null);
        }
      });
    }, [db, items, isOnline, totalAssigned]),
  );

  const showDirectionSelector = items.some((event) =>
    event.sections.some((section) => section.checkOutEnabled),
  );

  const handlePressCheckin = () => dispatch(setScanDirection('check_in'));

  const handlePressCheckout = () => dispatch(setScanDirection('check_out'));

  const handleScannedCode = ({ data }: { data: string }) => {
    try {
      if (data && !qrLock.current) {
        qrLock.current = true;
        setTimeout(() => {
          router.replace({ pathname: '/scan-result', params: { scannedCode: data, direction } });
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

  const headerTitle = items.length === 1 ? items[0].eventName : scanAccess?.config.label || '';
  const readingModeLabel = scanAccess
    ? scanAccess.config.mode === 'CHECK'
      ? 'Verificación de QR'
      : 'Quema de QR'
    : '';

  useEffect(() => {
    if (!showDirectionSelector) {
      dispatch(setScanDirection('check_in'));
    }
  }, [showDirectionSelector]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  return {
    torchEnabled,
    myScans,
    totalPending,
    totalAssigned,
    infoSheetHeight,
    setInfoSheetHeight,
    isOnline,
    lastSyncDate,
    headerTitle,
    readingModeLabel,
    handleScannedCode,
    handleToggleTorch,
    handleBack,
    showDirectionSelector,
    direction,
    handlePressCheckin,
    handlePressCheckout,
    cameraHeight,
    cameraWidth,
    setCameraHeight,
    setCameraWidth,
  };
}

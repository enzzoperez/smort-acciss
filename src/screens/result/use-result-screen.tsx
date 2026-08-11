import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isApiError, useValidateAndRegisterMutation } from '@/api/scanner-api';
import { useAppSelector, useAppDispatch } from '@/libs/redux';
import { DIRECTION_SCAN } from '@/constants/scan-directions';
import { ActionLabel } from './action-label';
import NotValidTicket from '@/assets/svg/not-valid-ticket-error.svg';

import CheckAccess from '@/assets/svg/check-access.svg';
import ScanAccess from '@/assets/svg/scan-access.svg';

import { getReadErrorByCode, ReasonErrorResult } from '@/utils/get-error-result';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { insertTicketScan } from '@/db/repositories/valid-tickets.repository';
import { getTicketByQr, countTickets } from '@/db/repositories/tickets.repository';
import { useDb } from '@/hooks/use-db';
import * as crypto from 'expo-crypto';
import { validateQrOfflineFlow } from './utils/offline-validator';
import { incrementalSyncTickets } from '@/db/utils';
import { getEventSync } from '@/db/repositories/events-sync.repository';
import { setTotalAssigned } from '@/store/slices';
import { reportError as logError, reportMessage as logMessage } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { formatDateWithOffset } from '@/utils/dates-utils';

export const useResultScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { scannedCode, direction } = useLocalSearchParams<{
    scannedCode: string;
    direction: DIRECTION_SCAN;
  }>();
  const { selectedEvent, verifyOnly, configEventQr, serverOffset, selectedEventConfig } =
    useAppSelector((state) => state.config);
  const { userData } = useAppSelector((state) => state.user);
  const { db } = useDb();
  const validEventIds: string[] =
    selectedEventConfig?.type === 'ALIAS'
      ? (selectedEventConfig.item?.map((i) => i.eventCode) ?? [])
      : selectedEvent
        ? [selectedEvent]
        : [];
  const validSections: string[] =
    selectedEventConfig?.type === 'ALIAS'
      ? [...new Set(selectedEventConfig.item?.flatMap((i) => i.sections) ?? [])]
      : (selectedEventConfig?.sections ?? []);

  const { isOnline } = useNetwork();
  const onlineSnapshotRef = useRef(isOnline);

  const [localResult, setLocalResult] = useState<
    | { type: 'success' }
    | {
        type: 'error';
        reason: ReasonErrorResult;
      }
    | null
  >(null);

  const { sync } = useSyncOfflineData();

  const [
    validateAndRegister,
    { isLoading: isLoadingRequest, error: errorRequest, isSuccess: isSuccessRequest },
  ] = useValidateAndRegisterMutation();

  const errorParsed = isApiError(errorRequest) ? errorRequest.data.errors[0] : undefined;

  const errorItem = getReadErrorByCode({
    code: errorParsed?.code ?? '',
    isConnected: onlineSnapshotRef.current,
  });

  const infoUsedData = errorItem?.code === 'ACCTRL-004' ? errorParsed : null;

  useEffect(() => {
    const processQr = async () => {
      if (!scannedCode || !db) {
        logError('No se recibió un código QR para procesar o la base de datos no está lista');
        return;
      }

      const online = onlineSnapshotRef.current;

      setLocalResult(null);

      // ====================
      // OFFLINE
      // ====================
      if (!online) {
        if (direction === 'check_out') {
          if (!verifyOnly) {
            await insertTicketScan(db, {
              id: crypto.randomUUID(),
              qr: scannedCode as string,
              eventId: selectedEvent!,
              scannedAt: formatDateWithOffset(new Date()),
              syncStatus: 'pending',
            });
          }

          setLocalResult({ type: 'error', reason: 'NETWORK_ERROR' });
          return;
        }

        const result = await validateQrOfflineFlow({
          db,
          qr: scannedCode as string,
          validEventIds,
          serverOffset,
          configEventQr,
          allowedSections: validSections.length > 0 ? validSections : null,
          verifyOnly,
        });

        setLocalResult(result);
        return;
      }

      // ====================
      // ONLINE
      // ====================
      try {
        const zoneId =
          selectedEventConfig?.sections.length === 1 ? selectedEventConfig.sections[0] : undefined;

        await validateAndRegister({
          eventCode: selectedEvent!,
          qrCode: scannedCode as string,
          direction: direction ?? 'check_in',
          zoneId,
        });
        await sync();
      } catch (error) {
        logError(error);
      } finally {
        for (const id of validEventIds) {
          const eventSync = await getEventSync(db, id, userData?.accountId ?? '');
          await incrementalSyncTickets({ eventId: id, db, fromDate: eventSync?.lastSyncDate });
        }
        dispatch(setTotalAssigned(await countTickets(db, validEventIds, validSections)));
      }
    };

    processQr();
  }, [scannedCode, db]);

  useEffect(() => {
    if (isSuccessRequest && db) {
      getTicketByQr(db, scannedCode as string).then((ticket) => {
        insertTicketScan(db, {
          id: crypto.randomUUID(),
          qr: scannedCode as string,
          eventId: ticket?.eventId ?? selectedEvent!,
          scannedAt: new Date().toISOString(),
          syncStatus: 'synced',
        });
      });
    }
  }, [isSuccessRequest]);

  const syncIfOnline = async () => {
    if (!isOnline || !db || !userData?.accountId || validEventIds.length === 0) return;
    const synced = await sync();
    if (!synced) {
      Alert.alert(
        'Error de sincronización',
        'No se pudieron enviar los escaneos pendientes. Por favor revisá tu conexión e intentá nuevamente.',
      );
      return;
    }
    for (const id of validEventIds) {
      const eventSync = await getEventSync(db, id, userData.accountId);
      await incrementalSyncTickets({ eventId: id, db, fromDate: eventSync?.lastSyncDate });
    }
    dispatch(setTotalAssigned(await countTickets(db, validEventIds, validSections)));
  };

  const handleScanQr = async () => {
    trackEvent(TrackingEvents.SCAN_AGAIN_PRESSED);
    await syncIfOnline();
    router.replace('/camera');
  };

  const handleGoHome = async () => {
    trackEvent(TrackingEvents.GO_HOME_PRESSED);
    await syncIfOnline();
    router.replace('/select-events');
  };

  const getScreenElements = useCallback(() => {
    if (localResult?.type === 'success') {
      return {
        mainIcon: verifyOnly ? <CheckAccess /> : <ScanAccess />,
        title: verifyOnly ? 'Acceso confirmado' : 'Acceso confirmado y quemado',
        message: verifyOnly
          ? 'El código QR es válido para este sector/puerta.'
          : 'El código QR es válido para este sector/puerta. Este ticket no podrá reutilizarse.',
        actionLabel: <ActionLabel action="Permitir el ingreso" />,
      };
    }

    if (localResult?.type === 'error') {
      const offlineError = getReadErrorByCode({
        code: localResult.reason,
        reason: localResult.reason as ReasonErrorResult,
        isConnected: false,
      });

      return {
        mainIcon: offlineError?.icon,
        title: offlineError?.title,
        message: offlineError?.message,
        actionLabel: <ActionLabel action={offlineError?.action ?? 'No permitir ingreso'} />,
      };
    }

    if (isSuccessRequest) {
      return {
        mainIcon: verifyOnly ? <CheckAccess /> : <ScanAccess />,
        title: verifyOnly ? 'Acceso confirmado' : 'Acceso confirmado y quemado',
        message: verifyOnly
          ? 'El código QR es válido para este sector/puerta.'
          : 'El código QR es válido para este sector/puerta. Este ticket no podrá reutilizarse.',
        actionLabel: <ActionLabel action="Permitir el ingreso" />,
      };
    }

    if (errorItem) {
      return {
        mainIcon: errorItem?.icon,
        title: errorItem?.title,
        message: errorItem?.message,
        actionLabel: <ActionLabel action={errorItem.action} />,
      };
    }

    return {
      mainIcon: <NotValidTicket />,
      title: 'Error desconocido',
      message: 'Ha ocurrido un error inesperado.',
      actionLabel: <ActionLabel action="No permitir ingreso" />,
    };
  }, [localResult, isSuccessRequest, errorItem, verifyOnly]);

  useEffect(() => {
    if (isSuccessRequest) {
      trackEvent(TrackingEvents.SCAN_RESULT_RECEIVED);
    }
  }, [isSuccessRequest]);

  useEffect(() => {
    if (isSuccessRequest) {
      trackEvent(TrackingEvents.SCAN_RESULT_RECEIVED);
    }
  }, [isSuccessRequest]);

  useEffect(() => {
    if (errorRequest) {
      const errorCode = errorParsed?.code ?? 'UNKNOWN';
      trackEvent(TrackingEvents.SCAN_RESULT_RECEIVED, { error_code: errorCode });
      logMessage(`Error desconocido en validación de QR: ${JSON.stringify(errorRequest)}`);
    }
  }, [errorRequest]);

  useEffect(() => {
    if (isSuccessRequest) {
      trackEvent(TrackingEvents.SCAN_RESULT_RECEIVED);
    }
  }, [isSuccessRequest]);

  useEffect(() => {
    if (errorRequest) {
      const errorCode = errorParsed?.code ?? 'UNKNOWN';
      trackEvent(TrackingEvents.SCAN_RESULT_RECEIVED, { error_code: errorCode });
      logMessage(`Error desconocido en validación de QR: ${JSON.stringify(errorRequest)}`);
    }
  }, [errorRequest]);

  return {
    scannedCode,
    isLoadingRequest,
    handleScanQr,
    handleGoHome,
    getScreenElements,
    infoUsedData,
  };
};

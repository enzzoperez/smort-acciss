import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useValidateAndRegisterMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { ActionLabel } from './action-label';
import NotValidTicket from '@/assets/svg/not-valid-ticket-error.svg';

import CheckAccess from '@/assets/svg/check-access.svg';
import ScanAccess from '@/assets/svg/scan-access.svg';

import { getReadErrorByCode, ReasonErrorResult } from '@/utils/get-error-result';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { logError, logMessage } from '@/libs/crashlytics';
import { insertTicketScan } from '@/db/repositories/valid-tickets.repository';
import { useDb } from '@/hooks/use-db';
import * as crypto from 'expo-crypto';
import { validateQrOfflineFlow } from './utils/offline-validator';
import { incrementalSyncTickets } from '@/db/utils';
import { getEventSync } from '@/db/repositories/events-sync.repository';

export const useResultScreen = () => {
  const router = useRouter();
  const { scannedCode } = useLocalSearchParams();
  const { selectedEvent, verifyOnly, configEventQr, serverOffset, selectedEventConfig } =
    useAppSelector((state) => state.config);
  const { userData } = useAppSelector((state) => state.user);
  const { db } = useDb();

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

  const errorParsed = errorRequest?.data?.errors && errorRequest?.data?.errors[0];

  const errorItem = getReadErrorByCode({
    code: errorParsed?.code,
    isConnected: onlineSnapshotRef.current,
  });

  useEffect(() => {
    const processQr = async () => {
      if (!scannedCode || !db) {
        logError('No se recibió un código QR para procesar o la base de datos no está lista');
        return;
      }

      const eventId = selectedEvent!;
      const online = onlineSnapshotRef.current;

      setLocalResult(null);

      // ====================
      // OFFLINE
      // ====================
      if (!online) {
        const result = await validateQrOfflineFlow({
          db,
          qr: scannedCode as string,
          currentEventId: eventId,
          serverOffset,
          configEventQr,
          allowedSections: selectedEventConfig?.sections || null,
          verifyOnly,
        });

        setLocalResult(result);
        return;
      }

      // ====================
      // ONLINE
      // ====================
      try {
        await validateAndRegister({
          eventCode: selectedEvent!,
          qrCode: scannedCode as string,
        });
        await sync();
      } catch (error) {
        logError(error);
      } finally {
        const eventSync = await getEventSync(db, eventId, userData?.accountId ?? '');
        await incrementalSyncTickets({ eventId, db, fromDate: eventSync?.lastSyncDate });
      }
    };

    processQr();
  }, [scannedCode, db]);

  useEffect(() => {
    if (isSuccessRequest && db) {
      insertTicketScan(db, {
        id: crypto.randomUUID(),
        qr: scannedCode as string,
        scannedAt: new Date().toISOString(),
        syncStatus: 'synced',
      });
    }
  }, [isSuccessRequest]);

  const syncIfOnline = async () => {
    if (!isOnline || !db || !selectedEvent || !userData?.accountId) return;
    await sync();
    const eventSync = await getEventSync(db, selectedEvent, userData.accountId);
    await incrementalSyncTickets({ eventId: selectedEvent, db, fromDate: eventSync?.lastSyncDate });
  };

  const handleScanQr = async () => {
    await syncIfOnline();
    router.replace('/camera');
  };

  const handleGoHome = async () => {
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
        actionLabel: <ActionLabel type="success" />,
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
        actionLabel: <ActionLabel type="error" />,
      };
    }

    if (isSuccessRequest) {
      return {
        mainIcon: verifyOnly ? <CheckAccess /> : <ScanAccess />,
        title: verifyOnly ? 'Acceso confirmado' : 'Acceso confirmado y quemado',
        message: verifyOnly
          ? 'El código QR es válido para este sector/puerta.'
          : 'El código QR es válido para este sector/puerta. Este ticket no podrá reutilizarse.',
        actionLabel: <ActionLabel type="success" />,
      };
    }

    if (errorItem) {
      return {
        mainIcon: errorItem?.icon,
        title: errorItem?.title,
        message: errorItem?.message,
        actionLabel: <ActionLabel type="error" />,
      };
    }

    return {
      mainIcon: <NotValidTicket />,
      title: 'Error desconocido',
      message: 'Ha ocurrido un error inesperado.',
      actionLabel: <ActionLabel type="error" />,
    };
  }, [localResult, isSuccessRequest, errorItem, verifyOnly]);

  useEffect(() => {
    if (errorRequest) {
      logMessage(`Error desconocido en validación de QR: ${JSON.stringify(errorRequest)}`);
    }
  }, [errorRequest]);

  return {
    scannedCode,
    isLoadingRequest,
    handleScanQr,
    handleGoHome,
    getScreenElements,
  };
};

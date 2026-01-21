import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useValidateAndRegisterMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { ActionLabel } from './action-label';
import NotValidTicket from '@/assets/svg/not-valid-ticket-error.svg';

import CheckAccess from '@/assets/svg/check-access.svg';
import ScanAccess from '@/assets/svg/scan-access.svg';

import { getReadErrorByCode } from '@/utils/get-error-result';
import { useNetwork } from '@/providers/network-provider';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { logError } from '@/libs/crashlytics';
import { getTicketByQr } from '@/db/repositories/tickets.repository';
import { insertNoValidTicket } from '@/db/repositories/no-valid-tickets.repository';
import { getScanTicketByQr, insertTicketScan } from '@/db/repositories/valid-tickets.repository';
import { useDb } from '@/hooks/use-db';
import * as crypto from 'expo-crypto';

export const useResultScreen = () => {
  const router = useRouter();
  const { scannedCode } = useLocalSearchParams();
  const { selectedEvent, verifyOnly } = useAppSelector((state) => state.config);
  const { db } = useDb();

  const { isOnline } = useNetwork();
  const onlineSnapshotRef = useRef(isOnline);

  const [localResult, setLocalResult] = useState<
    { type: 'success' } | { type: 'error'; reason: 'QR_HAS_USED' | 'QR_NOT_FOUND' } | null
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
      if (!scannedCode || !db) return;

      const qr = scannedCode as string;
      const eventId = selectedEvent!;
      const online = onlineSnapshotRef.current;

      setLocalResult(null);

      // ====================
      // OFFLINE
      // ====================
      if (!online) {
        const alreadyScanned = await getScanTicketByQr(db, qr);

        if (alreadyScanned) {
          setLocalResult({ type: 'error', reason: 'QR_HAS_USED' });

          await insertNoValidTicket(db, {
            id: crypto.randomUUID(),
            qr,
            scannedAt: new Date().toISOString(),
            reason: 'QR_HAS_USED',
            syncStatus: 'pending',
          });

          return;
        }

        const ticket = await getTicketByQr(db, qr);

        if (!ticket) {
          setLocalResult({ type: 'error', reason: 'QR_NOT_FOUND' });

          await insertNoValidTicket(db, {
            id: crypto.randomUUID(),
            qr,
            scannedAt: new Date().toISOString(),
            reason: 'QR_NOT_FOUND',
            syncStatus: 'pending',
          });

          return;
        }

        await insertTicketScan(db, {
          id: crypto.randomUUID(),
          qr,
          scannedAt: new Date().toISOString(),
          syncStatus: 'pending',
        });

        setLocalResult({ type: 'success' });
        return;
      }

      // ====================
      // ONLINE
      // ====================
      try {
        await sync();
        await validateAndRegister({
          eventCode: selectedEvent!,
          qrCode: qr,
        });
        await insertTicketScan(db, {
          id: crypto.randomUUID(),
          qr,
          scannedAt: new Date().toISOString(),
          syncStatus: 'synced',
        });
      } catch (error) {
        logError(error);
      }
    };

    processQr();
  }, [scannedCode, db]);

  const handleScanQr = () => {
    router.replace('/camera');
  };

  const handleGoHome = () => {
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
        reason: localResult.reason,
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

  return {
    scannedCode,
    isLoadingRequest,
    handleScanQr,
    handleGoHome,
    getScreenElements,
  };
};

import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useValidateAndRegisterMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { ActionLabel } from './action-label';
import NotValidTicket from '@/assets/svg/not-valid-ticket-error.svg';

import CheckAccess from '@/assets/svg/check-access.svg';
import ScanAccess from '@/assets/svg/scan-access.svg';

import { getReadErrorByCode } from '@/utils/get-error-result';
import { useNetwork } from '@/providers/network-provider';
import { saveQrOffline } from '@/storage/qr-storage';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';
import { logError, logMessage } from '@/libs/crashlytics';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';

export const useResultScreen = () => {
  const router = useRouter();
  const { scannedCode } = useLocalSearchParams();
  const { selectedEvent, verifyOnly } = useAppSelector((state) => state.config);

  const { isOnline } = useNetwork();
  const onlineSnapshotRef = useRef(isOnline);

  const { sync } = useSyncOfflineData();

  const [
    validateAndRegister,
    { isLoading: isLoadingRequest, error: errorRequest, isSuccess: isSuccessRequest },
  ] = useValidateAndRegisterMutation();

  const [errorNetwork, setErrorNetwork] = useState<boolean>(false);

  const errorParsed = errorRequest?.data?.errors && errorRequest?.data?.errors[0];

  const errorItem = getReadErrorByCode({
    code: errorParsed?.code,
    isConnected: onlineSnapshotRef.current,
  });

  useEffect(() => {
    const processQr = async () => {
      if (!scannedCode) return;
      const online = onlineSnapshotRef.current;
      if (!online) {
        await saveQrOffline(scannedCode as string);
        setErrorNetwork(true);
        return;
      }
      try {
        await sync();
        await validateAndRegister({
          eventCode: selectedEvent!,
          qrCode: scannedCode as string,
        });
      } catch (error) {
        logError(error);
      }
    };
    processQr();
  }, [scannedCode]);

  const handleScanQr = () => {
    router.replace('/camera');
  };

  const handleGoHome = () => {
    router.replace('/select-events');
  };

  const screenElements = {
    successRequest: {
      mainIcon: verifyOnly ? <CheckAccess /> : <ScanAccess />,
      title: verifyOnly ? 'Acceso confirmado' : 'Acceso confirmado y quemado',
      message: verifyOnly
        ? 'El código QR es válido para este sector/puerta.'
        : 'El código QR es válido para este sector/puerta. Este ticket no podrá reutilizarse.',
      key: null,
      actionLabel: <ActionLabel type={'success'} />,
    },
    onlineError: {
      mainIcon: errorItem?.icon,
      title: errorItem?.title,
      message: errorItem?.message,
      key: errorItem?.key,
      actionLabel: <ActionLabel type={'error'} />,
    },
    offlineError: {
      mainIcon: errorItem?.icon,
      title: errorItem?.title,
      message: errorItem?.message,
      key: 'NETWORK_ERROR',
      actionLabel: <ActionLabel type={'success'} />,
    },
    defaultError: {
      mainIcon: <NotValidTicket />,
      title: (errorParsed && errorParsed?.code) || 'Error desconocido',
      message: `Ha ocurrido un error desconocido. Por favor, inténtalo de nuevo. ${(errorParsed && errorParsed?.message) || ''}`,
      key: errorItem?.key,
      actionLabel: <ActionLabel type={'error'} />,
    },
  };

  const getScreenElements = () => {
    if (isSuccessRequest) {
      return screenElements.successRequest;
    }

    if (errorItem && !errorNetwork) {
      return screenElements.onlineError;
    }

    if (errorNetwork) {
      return screenElements.offlineError;
    }

    return screenElements.defaultError;
  };

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
    isSuccessRequest,
    errorNetwork,
    handleScanQr,
    handleGoHome,
    getScreenElements,
  };
};

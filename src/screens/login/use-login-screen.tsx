import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { ECredentialType } from '@/types/user';
import { useGetEventQrConfigByCodeMutation } from '@/api/events-api';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { setResetConfig, setScanAccess } from '@/store/slices';
import { isPinDisabledError } from '@/utils/api-errors';
import { reportError } from '@/utils/error-logger';
import { useDb } from '@/hooks/use-db';
import { hasPendingOfflineTickets } from '@/db/utils';

export function useLoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { scanAccess } = useAppSelector((state) => state.config);
  const { db } = useDb();
  const [permission, requestPermission] = useCameraPermissions();

  const [documentType, setDocumentType] = useState<ECredentialType>(ECredentialType.CI);
  const [documentValue, setDocumentValue] = useState('');
  const [observation, setObservation] = useState('');
  const [code, setCode] = useState('');
  const [scanAccessAtLaunch] = useState(scanAccess);
  const [isCheckingSession, setIsCheckingSession] = useState(!!scanAccessAtLaunch);

  const dbRef = useRef(db);

  const [getEventQrConfigByCode, { isLoading }] = useGetEventQrConfigByCodeMutation();
  const { apiErrorHandler } = useApiErrorHandler();

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
  };

  const handleLoginRequest = async () => {
    try {
      const config = await getEventQrConfigByCode(code).unwrap();
      dispatch(
        setScanAccess({
          config,
          operatorDocument: documentValue,
          observation,
        }),
      );
      router.replace('/select-events');
    } catch (error) {
      apiErrorHandler(error);
    }
  };

  useEffect(() => {
    if (permission === null) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (!scanAccessAtLaunch) return;

    let cancelled = false;

    (async () => {
      try {
        const config = await getEventQrConfigByCode(scanAccessAtLaunch.config.pin).unwrap();
        if (cancelled) return;
        dispatch(
          setScanAccess({
            config,
            operatorDocument: scanAccessAtLaunch.operatorDocument,
            observation: scanAccessAtLaunch.observation,
          }),
        );
      } catch (error) {
        if (cancelled) return;
        if (isPinDisabledError(error)) {
          const currentDb = dbRef.current;
          const pendingTickets = currentDb ? await hasPendingOfflineTickets(currentDb) : false;
          if (pendingTickets) {
            Alert.alert(
              'No se pudo cerrar la sesión',
              'El pin fue deshabilitado, pero hay tickets pendientes de sincronizar. Una vez sincronizados, se podra cerrar la sesión.',
            );
          } else {
            dispatch(setResetConfig());
            apiErrorHandler(error);
          }
        } else {
          reportError(error);
        }
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scanAccessAtLaunch, getEventQrConfigByCode, dispatch, apiErrorHandler]);

  useEffect(() => {
    if (scanAccess && !isCheckingSession) {
      router.replace('/select-events');
    }
  }, [scanAccess, isCheckingSession]);

  // db se resuelve async (DbProvider) después del mount; se lee por ref para no
  // agregarlo a las deps del efecto de abajo y evitar que se vuelva a disparar
  // el /resolve cuando db pase de null a listo.
  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  return {
    isLoading,
    isCheckingSession,
    documentType,
    setDocumentType,
    documentValue,
    setDocumentValue,
    observation,
    setObservation,
    code,
    handleCodeChange,
    handleLoginRequest,
  };
}

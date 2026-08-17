import { useEffect, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { ECredentialType } from '@/types/user';
import { useGetEventQrConfigByCodeMutation } from '@/api/events-api';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { setScanAccess } from '@/store/slices';

export function useLoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { scanAccess } = useAppSelector((state) => state.config);
  const [permission, requestPermission] = useCameraPermissions();

  const [documentType, setDocumentType] = useState<ECredentialType>(ECredentialType.CI);
  const [documentValue, setDocumentValue] = useState('');
  const [observation, setObservation] = useState('');
  const [code, setCode] = useState('');
  const [getEventQrConfigByCode, { isLoading }] = useGetEventQrConfigByCodeMutation();
  const { apiErrorHandler } = useApiErrorHandler();

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/[^a-zA-Z0-9-]/g, ''));
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
    if (scanAccess) {
      router.replace('/select-events');
    }
  }, [scanAccess]);

  return {
    isLoading,
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

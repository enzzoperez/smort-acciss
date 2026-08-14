import { useEffect, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { useLoginMutation } from '@/api/auth-api';
import { setAccessToken, setRefreshToken, setUserData } from '@/store/slices';
import { useAppDispatch } from '@/libs/redux';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent, setTrackingUserId } from '@/libs/tracking';

export function useLoginScreen() {
  const dispatch = useAppDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const [login, { isLoading }] = useLoginMutation();
  const { apiErrorHandler } = useApiErrorHandler();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLoginRequest = async () => {
    try {
      const data = await login({
        accountCredentialType: 'PHONE_NUMBER',
        accountCredentialValue: phoneNumber,
        password: password,
      }).unwrap();

      const { tokens, ...userWithoutTokens } = data;

      dispatch(setAccessToken(tokens.accessToken));
      dispatch(setRefreshToken(tokens.refreshToken));
      dispatch(setUserData(userWithoutTokens));
      setTrackingUserId(phoneNumber);
      trackEvent(TrackingEvents.LOGIN_SUCCESS);
    } catch (error) {
      apiErrorHandler(error);
    }
  };

  const togglePasswordVisible = () => setPasswordVisible((prev) => !prev);

  useEffect(() => {
    if (permission === null) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  return {
    isLoading,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    passwordVisible,
    togglePasswordVisible,
    handleLoginRequest,
  };
}

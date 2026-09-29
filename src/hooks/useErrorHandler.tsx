import { useCallback } from 'react';
import { reportError as logError } from '@/utils/error-logger';
import { Alert } from 'react-native';
import { API_ERROR_MESSAGES } from '@/constants/api-error-messages';

export const useApiErrorHandler = () => {
  const apiErrorHandler = useCallback((error: ApiError | any) => {
    logError(error);
    if (error?.data?.errors) {
      const { code, message } = (error as ApiError).data.errors[0];
      Alert.alert('Error', API_ERROR_MESSAGES[code] ?? message);
    } else {
      console.error('error en apiErrorHandler', error);
      Alert.alert(
        'Error',
        `Ocurrio un error, intenta nuevamente por favor. ${error?.code ? `Code: ${error?.code}` : ''}`,
      );
    }
  }, []);

  return { apiErrorHandler };
};

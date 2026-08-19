import { useCallback } from 'react';
import { reportError as logError } from '@/utils/error-logger';
import { Alert } from 'react-native';

export const useApiErrorHandler = () => {
  const apiErrorHandler = useCallback((error: ApiError | any) => {
    logError(error);
    if (error?.data?.errors) {
      const { message } = (error as ApiError).data.errors[0];
      Alert.alert('Error', message);
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

import { logError } from '@/libs/crashlytics';
import { Alert } from 'react-native';

export const useApiErrorHandler = () => {
  const apiErrorHandler = (error: ApiError | any) => {
    logError(error);
    if (error?.data?.errors) {
      const { message } = (error as ApiError).data.errors[0];
      Alert.alert('Error', message);
    } else {
      Alert.alert('Error', 'Ocurrio un error, intenta nuevamente por favor.');
    }
  };

  return { apiErrorHandler };
};

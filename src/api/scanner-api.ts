import { DIRECTION_SCAN } from '@/constants/scan-directions';
import { rootApi } from './root-api';

export interface ApiErrorItem {
  code: string;
  message: string;
  data?: Record<string, string> | null;
}

export interface ApiErrorResponse {
  id: string;
  errors: [ApiErrorItem];
}

export function isApiError(error: unknown): error is { status: number; data: ApiErrorResponse } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as Record<string, unknown>).data === 'object' &&
    (error as Record<string, unknown>).data !== null &&
    'errors' in ((error as Record<string, unknown>).data as object)
  );
}

interface ReqScanQr {
  code: string;
  qrCode?: string;
  operatorDocument: string;
  observation: string;
  direction: DIRECTION_SCAN;
  zoneId?: string;
}

interface ReqSyncOfflineData {
  pin: string;
  observation: string;
  operatorDocument: string;
  qrCodes: {
    qrCode: string;
    timeScan: string;
    errorCode?: string;
  }[];
}

export const scannerApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    validateAndRegister: builder.mutation<unknown, ReqScanQr>({
      query: ({ code, qrCode, operatorDocument, observation, direction, zoneId }) => ({
        url: `/access-control/scan-access/scan?direction=${direction}${zoneId ? `&zoneId=${zoneId}` : ''}`,
        method: 'post',
        data: { code, qrCode, operatorDocument, observation },
        headers: {
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
        },
      }),
    }),

    syncOfflineData: builder.mutation<unknown, ReqSyncOfflineData>({
      query: ({ pin, observation, operatorDocument, qrCodes }) => ({
        url: `/access-control/scan-access/scan/off-line`,
        method: 'post',
        data: { pin, observation, operatorDocument, qrCodes },
        headers: {
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
        },
      }),
    }),
  }),
});

export const { useValidateAndRegisterMutation, useSyncOfflineDataMutation } = scannerApi;

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
  eventCode: string;
  qrCode?: string;
  direction: DIRECTION_SCAN;
  zoneId?: string;
}

interface ReqSyncOfflineData {
  eventCode: string;
  qrCodes: {
    qrCode: string;
    timeScan: string;
    errorCode?: string;
  }[];
}

export const scannerApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    validateAndRegister: builder.mutation<unknown, ReqScanQr>({
      query: ({ eventCode, qrCode, direction, zoneId }) => ({
        url: `/access-control/${eventCode}/scan?direction=${direction}${zoneId ? `&zoneId=${zoneId}` : ''}`,
        method: 'post',
        data: { qrCode },
      }),
    }),

    syncOfflineData: builder.mutation<unknown, ReqSyncOfflineData>({
      query: ({ eventCode, qrCodes }) => ({
        url: `/access-control/${eventCode}/scan/off-line`,
        method: 'post',
        data: { qrCodes },
      }),
    }),
  }),
});

export const { useValidateAndRegisterMutation, useSyncOfflineDataMutation } = scannerApi;

import { rootApi } from './root-api';

interface ReqValidateOnly {
  eventCode: string;
  qrCode?: string;
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
    validateAndRegister: builder.mutation<unknown, ReqValidateOnly>({
      query: ({ eventCode, qrCode }) => ({
        url: `/access-control/${eventCode}/scan`,
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

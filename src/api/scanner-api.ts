import { rootApi } from './root-api';

interface ReqValidateOnly {
  eventCode: string;
  qrCode?: string;
}

export const scannerApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    validateOnly: builder.mutation<unknown, ReqValidateOnly>({
      query: ({ eventCode, qrCode }) => ({
        url: `/access-control/${eventCode}/scan?verifyOnly=true`,
        method: 'post',
        data: { qrCode },
      }),
    }),

    validateAndRegister: builder.mutation<unknown, ReqValidateOnly>({
      query: ({ eventCode, qrCode }) => ({
        url: `/access-control/${eventCode}/scan`,
        method: 'post',
        data: { qrCode },
      }),
    }),
  }),
});

export const { useValidateOnlyMutation, useValidateAndRegisterMutation } = scannerApi;

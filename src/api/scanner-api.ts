import { rootApi } from './root-api';

interface ReqValidateOnly {
  eventCode: string;
  qrCode?: string;
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
  }),
});

export const { useValidateAndRegisterMutation } = scannerApi;

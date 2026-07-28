import { rootApi } from './root-api';

interface ResGetEvents {
  config: {
    eventCode: string;
    eventName: string;
    mode: string;
    sections: string[];
  }[];
}

export interface ResConfigEventQr {
  code: string;
  qrMode: string;
  eventSeed: string;
  alias: string;
  refreshInterval: number;
  serverTime: string;
  sections?: {
    checkOutEnabled: boolean;
    code: string;
  }[];
}

interface ReqGetEventQrConfig {
  eventCode: string;
}

export const eventApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<ResGetEvents, void>({
      query: () => ({
        url: '/access-control/event-config/scan',
        method: 'get',
      }),
    }),

    getEventQrConfig: builder.mutation<ResConfigEventQr[], ReqGetEventQrConfig>({
      query: ({ eventCode }) => ({
        url: `/access-control/qr-config/${eventCode}`,
        method: 'get',
        headers: {
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          'Authorization ': null,
        },
      }),
    }),
  }),
});

export const { useGetEventsQuery, useGetEventQrConfigMutation } = eventApi;

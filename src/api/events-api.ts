import { rootApi } from './root-api';

export interface ResConfigEventQr {
  code: string;
  qrMode: string;
  eventSeed: string;
  alias: string;
  refreshInterval: number;
  serverTime: string; // '2026-02-18T14:01:29.141Z';
}

export interface EventData {
  accountId: string;
  eventCode: string;
  eventName: string;
  id: string;
  mode: string;
  sections: string[];
  type: 'EVENT' | 'ALIAS';
  item?: {
    eventCode: string;
    sections: string[];
  }[];
}

export interface ResGetEvents {
  config: EventData[];
}

interface ReqGetEventQrConfig {
  eventCode: string;
}

export interface ConfigByCodePin {
  id: string;
  pin: string;
  label: string;
  enabled: boolean;
  issuedTicketsSyncEnabled: boolean;
  mode: string;
  items: {
    eventCode: string;
    eventName: string;
    eventDate: string;
    source: string;
    sections: {
      code: string;
      checkOutEnabled: boolean;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
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
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY_CONFIG || '',
          'Authorization ': null,
        },
      }),
    }),

    getEventQrConfigByCode: builder.mutation<ConfigByCodePin, string>({
      query: (codePin) => ({
        url: `/access-control/scan-access/resolve`,
        method: 'post',
        data: {
          pin: codePin,
        },
        headers: {
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
        },
      }),
    }),
  }),
});

export const { useGetEventsQuery, useGetEventQrConfigMutation, useGetEventQrConfigByCodeMutation } =
  eventApi;

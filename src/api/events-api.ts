import { rootApi } from './root-api';

interface ResGetEvents {
  config: {
    eventCode: string;
    eventName: string;
    mode: string;
    sections: string[];
  }[];
}

export const eventApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<ResGetEvents, void>({
      query: () => ({
        url: '/access-control/event-config/scan',
        method: 'get',
      }),
    }),
  }),
});

export const { useGetEventsQuery } = eventApi;

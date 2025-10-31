import { rootApi } from './root-api';

interface ResGetEvents {
  options: {
    code: string;
    value: string;
  }[];
}

interface EventOption {
  label: string;
  value: string;
}

export const eventApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventOption[], void>({
      query: () => ({
        url: '/access-control/event-config/options',
        method: 'get',
      }),
      transformResponse: (response: ResGetEvents) => {
        return response.options.map((item) => ({
          label: item.value,
          value: item.code,
        }));
      },
    }),
  }),
});

export const { useGetEventsQuery } = eventApi;

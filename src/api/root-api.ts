import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axios-base-query';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const rootApi = createApi({
  reducerPath: 'mobileRoot',
  baseQuery: axiosBaseQuery({
    baseUrl: BASE_URL ?? '',
  }),
  keepUnusedDataFor: 10,
  endpoints: () => ({}),
});

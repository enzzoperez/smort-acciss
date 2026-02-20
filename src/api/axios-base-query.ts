import { logError, logMessage } from '@/libs/crashlytics';
import { resetUserData, setLogout, setResetConfig } from '@/store/slices';
import { RootState } from '@/store/store';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { Alert } from 'react-native';

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'GET', data, params, headers }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const accessToken = state.auth?.accessToken;
    // const refreshToken = state.auth?.refreshToken;

    try {
      const authHeaders = {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: authHeaders,
      });

      return { data: result.data };
    } catch (axiosError) {
      logError(axiosError);
      const err = axiosError as AxiosError;
      const status = err.response?.status;

      if (status === 401) {
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        );
        logMessage('Unauthorized error, logging out user');
        try {
          dispatch(setLogout());
          dispatch(resetUserData());
          dispatch(setResetConfig());

          // const refreshResponse = await axios.put(
          //   `${baseUrl}/accounts/refresh-token`,
          //   { refreshToken },
          //   { headers: { Authorization: `Bearer ${accessToken}` } },
          // );

          // const newAccessToken = refreshResponse.data.tokens.accessToken;

          // // Save the new accesToken in redux
          // dispatch(setAccessToken(newAccessToken));

          // // Retry the original request with the new token
          // const retryResult = await axios({
          //   url: `${baseUrl}${url}`,
          //   method,
          //   data,
          // });

          // return { data: retryResult.data };
        } catch {
          // dispatch(setLogout());
        }
      }

      return { error: { status, data: err.response?.data } };
    }
  };

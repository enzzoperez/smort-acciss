import { reportError as logError, reportMessage as logMessage } from '@/utils/error-logger';
import { resetUserData, setAccessToken, setLogout, setResetConfig } from '@/store/slices';
import { RootState } from '@/store/store';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { Alert } from 'react-native';
import { isTokenExpired, isTokenExpiringSoon } from '@/utils/jwt-utils';

let isRefreshing = false;

async function tryRefreshToken(
  baseUrl: string,
  accessToken: string,
  refreshToken: string,
  dispatch: (action: unknown) => void,
): Promise<string | null> {
  try {
    isRefreshing = true;
    const response = await axios.put(
      `${baseUrl}/accounts/refresh-token`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const newAccessToken = response.data.tokens.accessToken;
    dispatch(setAccessToken(newAccessToken));
    return newAccessToken;
  } catch (error) {
    const axiosError = error as AxiosError;
    logMessage(
      `Token refresh failed: status=${axiosError.response?.status ?? 'network'}, message=${axiosError.message}`,
    );
    logError(error);
    return null;
  } finally {
    isRefreshing = false;
  }
}

function logoutUser(dispatch: (action: unknown) => void) {
  Alert.alert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  logMessage('Token expired, logging out user');
  dispatch(setLogout());
  dispatch(resetUserData());
  dispatch(setResetConfig());
}

/**
 * Proactive token refresh for code that calls axios directly (outside RTK Query),
 * e.g. the paginated ticket sync in db/utils.ts. Mirrors the check above so
 * long-running paginated requests can refresh mid-sync instead of failing with 401.
 */
export async function ensureValidAccessToken(
  baseUrl: string,
  getState: () => RootState,
  dispatch: (action: unknown) => void,
): Promise<string | null> {
  const state = getState();
  const accessToken = state.auth?.accessToken;
  const refreshToken = state.auth?.refreshToken;

  if (!accessToken) return null;

  // Skipped in dev: short-lived dev tokens would trigger this on every request
  if (__DEV__ || !refreshToken || !isTokenExpiringSoon(accessToken) || isRefreshing) {
    return accessToken;
  }

  if (isTokenExpired(accessToken)) {
    logoutUser(dispatch);
    return null;
  }

  const newToken = await tryRefreshToken(baseUrl, accessToken, refreshToken, dispatch);
  if (!newToken) {
    logMessage('Proactive refresh failed, continuing with current valid token');
  }
  return newToken ?? accessToken;
}

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
    let accessToken = state.auth?.accessToken;
    const refreshToken = state.auth?.refreshToken;

    // Proactive refresh: if token expires within 1 hour, refresh before the request
    // Skipped in dev: short-lived dev tokens would trigger this on every request
    if (
      !__DEV__ &&
      accessToken &&
      refreshToken &&
      isTokenExpiringSoon(accessToken) &&
      !isRefreshing
    ) {
      if (isTokenExpired(accessToken)) {
        // Token already expired — refresh won't work, logout immediately
        logoutUser(dispatch);
        return { error: { status: 401, data: 'Token expired' } };
      }
      const newToken = await tryRefreshToken(baseUrl, accessToken, refreshToken, dispatch);
      if (newToken) {
        accessToken = newToken;
      } else {
        logMessage('Proactive refresh failed, continuing with current valid token');
      }
    }

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
        logoutUser(dispatch);
      }

      return { error: { status, data: err.response?.data } };
    }
  };

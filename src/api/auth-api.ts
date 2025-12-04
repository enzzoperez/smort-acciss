import { IReqLogin, IReqLogout, LoginUserResponse } from '@/types/auth';
import { rootApi } from './root-api';

export const authApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginUserResponse, IReqLogin>({
      query: ({ accountCredentialType, accountCredentialValue, password }) => ({
        url: '/accounts/login',
        method: 'post',
        data: { accountCredentialType, accountCredentialValue, password },
      }),
    }),

    logout: builder.mutation<unknown, IReqLogout>({
      query: ({ accountId }) => ({
        url: '/accounts/logout',
        method: 'put',
        data: { accountId },
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;

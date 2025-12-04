import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserDataToConfirm {
  accountId: string | null | undefined;
}

interface AuthState {
  accessToken: string | null | undefined;
  refreshToken: string | null | undefined;
  dataToConfirm: UserDataToConfirm | null | undefined;
  tempPassword: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  dataToConfirm: null,
  tempPassword: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setDataToConfirm: (state, action: PayloadAction<UserDataToConfirm>) => {
      state.dataToConfirm = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | null | undefined>) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },
    setTempPassword: (state, action: PayloadAction<string | null>) => {
      state.tempPassword = action.payload;
    },
    setLogout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.dataToConfirm = null;
    },
  },
});

export const { setAccessToken, setRefreshToken, setLogout, setDataToConfirm, setTempPassword } =
  authSlice.actions;

import { UserState } from '../../types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserDataSlice {
  userData: UserState | null | undefined;
}

const initialState: IUserDataSlice = {
  userData: null,
};

export const userSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserState>) => {
      state.userData = action.payload;
    },
    updateUserData: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload,
        };
      }
    },
    resetUserData: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, updateUserData, resetUserData } = userSlice.actions;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConfigSlice {
  selectedEvent: string | null;
  verifyOnly: boolean;
}

const initialState: ConfigSlice = {
  selectedEvent: null,
  verifyOnly: true,
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setSelectedEvent: (state, action: PayloadAction<string | null>) => {
      state.selectedEvent = action.payload;
    },
    setVerifyOnly: (state, action: PayloadAction<boolean>) => {
      state.verifyOnly = action.payload;
    },

    setResetConfig: (state) => {
      state.selectedEvent = null;
      state.verifyOnly = true;
    },
  },
});

export const { setSelectedEvent, setVerifyOnly, setResetConfig } = configSlice.actions;

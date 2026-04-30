import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EventData {
  eventCode: string;
  eventName: string;
  mode: string;
  sections: string[];
}

interface ConfigSlice {
  selectedEvent: string | null;
  verifyOnly: boolean;
  availableEvents: EventData[];
}

const initialState: ConfigSlice = {
  selectedEvent: null,
  verifyOnly: true,
  availableEvents: [],
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
    setAvailableEvents: (state, action: PayloadAction<EventData[]>) => {
      state.availableEvents = action.payload;
    },
    setResetConfig: (state) => {
      state.selectedEvent = null;
      state.verifyOnly = true;
    },
  },
});

export const { setSelectedEvent, setVerifyOnly, setAvailableEvents, setResetConfig } =
  configSlice.actions;

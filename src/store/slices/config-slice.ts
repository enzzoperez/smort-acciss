import { EventData, ResConfigEventQr } from '@/api/events-api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface ConfigSlice {
  selectedEvent: string | null;
  verifyOnly: boolean;
  configEventQr: ResConfigEventQr | null;
  serverOffset: number;
  selectedEventConfig: EventData | null;
  totalAssigned: number | null;
  availableEvents: EventData[];
}

const initialState: ConfigSlice = {
  selectedEvent: null,
  verifyOnly: true,
  configEventQr: null,
  serverOffset: 0,
  selectedEventConfig: null,
  totalAssigned: null,
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

    setConfigEventQr: (state, action: PayloadAction<ResConfigEventQr>) => {
      state.configEventQr = action.payload;
    },

    setServerOffset: (state, action: PayloadAction<number>) => {
      state.serverOffset = action.payload;
    },

    setSelectedEventConfig: (state, action: PayloadAction<EventData>) => {
      state.selectedEventConfig = action.payload;
    },

    setTotalAssigned: (state, action: PayloadAction<number>) => {
      state.totalAssigned = action.payload;
    },

    setAvailableEvents: (state, action: PayloadAction<EventData[]>) => {
      state.availableEvents = action.payload;
    },

    setResetConfig: (state) => {
      state.selectedEvent = null;
      state.verifyOnly = true;
      state.configEventQr = null;
      state.serverOffset = 0;
      state.selectedEventConfig = null;
      state.totalAssigned = null;
      state.availableEvents = [];
    },
  },
});

export const {
  setSelectedEvent,
  setVerifyOnly,
  setResetConfig,
  setConfigEventQr,
  setServerOffset,
  setSelectedEventConfig,
  setTotalAssigned,
  setAvailableEvents,
} = configSlice.actions;

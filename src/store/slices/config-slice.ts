import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResConfigEventQr } from '@/api/events-api';
import { DIRECTION_SCAN } from '@/constants/scan-directions';
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
  configEventQr: ResConfigEventQr[] | null;
  direction: DIRECTION_SCAN;
  selectedEventConfig: EventData | null;
}

const initialState: ConfigSlice = {
  selectedEvent: null,
  verifyOnly: true,
  availableEvents: [],
  configEventQr: null,
  direction: 'check_in',
  selectedEventConfig: null,
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
    setConfigEventQr: (state, action: PayloadAction<ResConfigEventQr[]>) => {
      state.configEventQr = action.payload;
    },
    setScanDirection: (state, action: PayloadAction<DIRECTION_SCAN>) => {
      state.direction = action.payload;
    },
    setSelectedEventConfig: (state, action: PayloadAction<EventData>) => {
      state.selectedEventConfig = action.payload;
    },
    setResetConfig: (state) => {
      state.selectedEvent = null;
      state.verifyOnly = true;
      state.configEventQr = null;
      state.direction = 'check_in';
      state.selectedEventConfig = null;
    },
  },
});

export const {
  setSelectedEvent,
  setVerifyOnly,
  setAvailableEvents,
  setConfigEventQr,
  setScanDirection,
  setSelectedEventConfig,
  setResetConfig,
} = configSlice.actions;

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authSlice, configSlice, userSlice } from './slices';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
  type Storage,
} from 'redux-persist';
import * as SecureStore from 'expo-secure-store';
import { rootApi } from '@/api/root-api';

// Replace for valid key in securestore
function sanitizeKeyHelper(key: string, replaceCharacter = '_'): string {
  return key.replace(/[^a-z0-9.\-_]/gi, replaceCharacter);
}

const createAuthStorage = (): Storage => ({
  setItem: (key, value) => {
    const sanitizeKey = sanitizeKeyHelper(key);
    const valueParsed = JSON.parse(value);
    if (valueParsed.accessToken && valueParsed.refreshToken) {
      SecureStore.setItem(sanitizeKey + '_accessToken', valueParsed.accessToken);
      SecureStore.setItem(sanitizeKey + '_refreshToken', valueParsed.refreshToken);
      SecureStore.setItem(
        sanitizeKey + '_persist',
        JSON.stringify({ version: -1, rehydrated: true }),
      );
    }
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const sanitizeKey = sanitizeKeyHelper(key);

    const accessToken = SecureStore.getItem(sanitizeKey + '_accessToken');
    const refreshToken = SecureStore.getItem(sanitizeKey + '_refreshToken');

    if (!accessToken || !refreshToken) return Promise.resolve(null);

    const authData = JSON.stringify({
      accessToken,
      refreshToken,
    });

    return Promise.resolve(authData);
  },
  removeItem: (key) => {
    const sanitizeKey = sanitizeKeyHelper(key);
    SecureStore.deleteItemAsync(sanitizeKey + '_accessToken');
    SecureStore.deleteItemAsync(sanitizeKey + '_refreshToken');
    SecureStore.deleteItemAsync(sanitizeKey + '_persist');
    return Promise.resolve();
  },
});

const createCustomStorage = (): Storage => ({
  setItem: (key, value) => {
    const sanitizeKey = sanitizeKeyHelper(key);
    SecureStore.setItem(sanitizeKey, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const sanitizeKey = sanitizeKeyHelper(key);
    const value = SecureStore.getItem(sanitizeKey);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    const sanitizeKey = sanitizeKeyHelper(key);
    SecureStore.deleteItemAsync(sanitizeKey);
    return Promise.resolve();
  },
});

const authPersistConfig = {
  key: 'auth',
  storage: createAuthStorage(),
  whitelist: ['accessToken', 'refreshToken'],
};

const userPersistConfig = {
  key: 'user',
  storage: createCustomStorage(),
};

const configPersistConfig = {
  key: 'config',
  storage: createCustomStorage(),
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);
const persistedUserReducer = persistReducer(userPersistConfig, userSlice.reducer);
const persistedConfigReducer = persistReducer(configPersistConfig, configSlice.reducer);

const rootReducer = combineReducers({
  [rootApi.reducerPath]: rootApi.reducer,
  auth: persistedAuthReducer,
  user: persistedUserReducer,
  config: persistedConfigReducer,
});

const middlewares = [rootApi.middleware];

export const store = configureStore({
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(middlewares),
  reducer: rootReducer,
  ...(process.env.NODE_ENV !== 'production' && {
    enhancers: (getDefaultEnhancers) => {
      return getDefaultEnhancers().concat();
    },
  }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

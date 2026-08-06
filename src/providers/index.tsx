import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './auth-provider';
import { UiProvider } from './ui-provider';
import { StoreProvider } from './store-provider';
import { NetworkProvider } from './network-provider';
import { UpdatesProvider } from './updates-provider';

interface ICustomProviders {
  children: React.ReactNode;
}

export const CustomProviders: React.FC<ICustomProviders> = ({ children }) => {
  return (
    <StoreProvider>
      <UiProvider>
        <NetworkProvider>
          <UpdatesProvider>
            <AuthProvider>
              <SafeAreaProvider>{children}</SafeAreaProvider>
            </AuthProvider>
          </UpdatesProvider>
        </NetworkProvider>
      </UiProvider>
    </StoreProvider>
  );
};

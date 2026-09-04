import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UiProvider } from './ui-provider';
import { StoreProvider } from './store-provider';
import { NetworkProvider } from './network-provider';
import { DbProvider } from './db-provider';
import { UpdatesProvider } from './updates-provider';
import { PrivacyOverlay } from './prevent-captures-provider';
interface ICustomProviders {
  children: React.ReactNode;
}

export const CustomProviders: React.FC<ICustomProviders> = ({ children }) => {
  return (
    <DbProvider>
      <StoreProvider>
        <NetworkProvider>
          <UpdatesProvider>
            <UiProvider>
              <SafeAreaProvider>{children}</SafeAreaProvider>
              <PrivacyOverlay />
            </UiProvider>
          </UpdatesProvider>
        </NetworkProvider>
      </StoreProvider>
    </DbProvider>
  );
};

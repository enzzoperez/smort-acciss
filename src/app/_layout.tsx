import '@/i18n/i18n-config';
import { CustomProviders } from '@/providers';
import * as Clarity from '@microsoft/react-native-clarity';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();
Clarity.initialize(process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID!, {
  logLevel: __DEV__ ? Clarity.LogLevel.Verbose : Clarity.LogLevel.None,
});

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    UenoLogicalBold: require('../assets/fonts/UenoLogical-Bold.ttf'),
    UenoLogicalBook: require('../assets/fonts/UenoLogical-Book.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <CustomProviders>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="select-events"
          options={{
            gestureEnabled: false,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="scan-result"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </CustomProviders>
  );
}

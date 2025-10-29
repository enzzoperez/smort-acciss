import BackHeader from '@/components/back-header';
import CustomHeader from '@/components/custom-header';
import '@/i18n/i18n-config';
import { CustomProviders } from '@/providers';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

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
            header: (props) => <CustomHeader {...props} />,
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            header: () => <BackHeader />,
          }}
        />
      </Stack>
    </CustomProviders>
  );
}

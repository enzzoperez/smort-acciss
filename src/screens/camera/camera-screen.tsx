import { CameraView } from 'expo-camera';
import { AppState, StatusBar, StyleSheet } from 'react-native';
import { Overlay } from './overlay';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isAndroid } from '@/utils/device-utils';

export default function CameraScreen() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {isAndroid() ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(async () => {
              router.replace({
                pathname: '/scan-result',
                params: { scannedCode: data },
              });
            }, 500);
          }
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}

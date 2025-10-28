import { CameraView } from 'expo-camera';
import { AppState, Platform, StatusBar, StyleSheet } from 'react-native';
import { Overlay } from './overlay';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen() {
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
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(async () => {
              console.log('MY QR DATA ', data);
            }, 500);
          }
        }}
      />
      <Overlay />
    </SafeAreaView>
  );
}

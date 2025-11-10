import { useRef, useState, useEffect } from 'react';
import { StyleSheet, StatusBar, AppState, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Overlay } from './overlay';
import { isAndroid } from '@/utils/device-utils';

export default function CameraScreen() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {isAndroid() ? <StatusBar hidden /> : null}

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(() => {
              router.replace({
                pathname: '/scan-result',
                params: { scannedCode: data },
              });
            }, 500);
          }
        }}
      />

      <Overlay />

      <View style={styles.flashButtonContainer}>
        <TouchableOpacity
          style={[styles.flashButton, { backgroundColor: torchOn ? '#007AFF' : 'rgba(0,0,0,0.5)' }]}
          onPress={() => setTorchOn((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={torchOn ? 'flash' : 'flash-off'}
            size={28}
            color={torchOn ? '#FFF' : '#E0E0E0'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flashButtonContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  flashButton: {
    padding: 16,
    borderRadius: 40,
  },
});

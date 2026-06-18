import { useEffect, useRef, useState } from 'react';
import { AppState, StatusBar, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Overlay } from './overlay';
import Flashlight from '@/assets/svg/flashlight.svg';
import FlashlightOff from '@/assets/svg/flashlight-off.svg';
import BackButtonCamera from '@/assets/svg/back-button-camera.svg';
import { reportError as logError } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { useNetwork } from '@/providers/network-provider';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';

export default function CameraScreen() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();

  const handleScannedCode = ({ data }: { data: string }) => {
    try {
      if (data && !qrLock.current) {
        qrLock.current = true;
        setTimeout(() => {
          router.replace({
            pathname: '/scan-result',
            params: { scannedCode: data },
          });
        }, 500);
      }
    } catch (error) {
      logError(error);
    }
  };

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
    <View style={StyleSheet.absoluteFillObject}>
      <StatusBar hidden translucent backgroundColor="transparent" />

      {!isOnline && (
        <View style={styles.bannerContainer}>
          <ConnectionStatusBanner isOnline={false} />
        </View>
      )}

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        onBarcodeScanned={handleScannedCode}
      />

      <Overlay />

      <View style={[styles.bottomButtons, { bottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.roundButton} onPress={() => router.back()}>
          <BackButtonCamera />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => {
            const next = !torchEnabled;
            trackEvent(TrackingEvents.FLASHLIGHT_TOGGLED, { flashlight_state: next ? 'on' : 'off' });
            setTorchEnabled(next);
          }}
        >
          {torchEnabled ? <Flashlight /> : <FlashlightOff />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  roundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

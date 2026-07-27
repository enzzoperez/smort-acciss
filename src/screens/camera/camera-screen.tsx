import { useEffect, useRef, useState } from 'react';
import { AppState, Dimensions, StatusBar, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Overlay } from './overlay';
import Flashlight from '@/assets/svg/flashlight.svg';
import FlashlightOff from '@/assets/svg/flashlight-off.svg';
import BackButton from '@/assets/svg/back-button-checkout.svg';
import Cloud from '@/assets/svg/cloud.svg';
import CloudOff from '@/assets/svg/cloud-off.svg';
import { Feather } from '@expo/vector-icons';
import { reportError as logError } from '@/utils/error-logger';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import { useNetwork } from '@/providers/network-provider';
import { ThemedText } from '@/components/themed-text';
import { theme } from '@/themes/theme';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { setScanDirection } from '@/store/slices';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';

const CAMERA_MARGIN = 24;
const cameraWidth = Dimensions.get('window').width - CAMERA_MARGIN * 2;

function getEventNameAndDate(eventName?: string): { name: string; date: string } {
  const match = eventName?.match(/^\((.+?)\)\s*(.+)$/);
  return {
    date: match?.[1] ?? '',
    name: match?.[2] ?? eventName ?? '',
  };
}

export default function CameraScreen() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraHeight, setCameraHeight] = useState(0);
  const [cameraWidth, setCameraWidth] = useState(0);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const dispatch = useAppDispatch();
  const direction = useAppSelector((state) => state.config.direction);
  const selectedEventConfig = useAppSelector((state) => state.config.selectedEventConfig);
  const configEventQr = useAppSelector((state) => state.config.configEventQr);
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();

  const showDirectionSelector =
    configEventQr?.some((config) => config.sections?.some((section) => section.checkOutEnabled)) ??
    false;

  const { name: eventName, date: eventDateTime } = getEventNameAndDate(
    selectedEventConfig?.eventName,
  );

  const handleScannedCode = ({ data }: { data: string }) => {
    try {
      if (data && !qrLock.current) {
        qrLock.current = true;
        setTimeout(() => {
          router.replace({
            pathname: '/scan-result',
            params: { scannedCode: data, direction },
          });
        }, 500);
      }
    } catch (error) {
      logError(error);
    }
  };

  useEffect(() => {
    if (!showDirectionSelector) {
      dispatch(setScanDirection('check_in'));
    }
  }, [showDirectionSelector]);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true);
      const timer = setTimeout(() => setShowOfflineBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* White top section: header + segmented control + info banner */}
      <View style={[styles.topSection, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <BackButton />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <ThemedText type="title" style={styles.headerTitle} numberOfLines={1}>
              {eventName}
            </ThemedText>
            {!!eventDateTime && (
              <ThemedText style={styles.headerSubtitle}>{eventDateTime}</ThemedText>
            )}
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerButton}>{isOnline ? <Cloud /> : <CloudOff />}</View>
          </View>
        </View>

        {showOfflineBanner && (
          <View style={styles.connectionBanner}>
            <ConnectionStatusBanner isOnline={false} />
          </View>
        )}

        {showDirectionSelector ? (
          <>
            <View style={styles.segmentedWrapper}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  direction === 'check_in' && styles.segmentButtonActive,
                ]}
                onPress={() => dispatch(setScanDirection('check_in'))}
              >
                <ThemedText
                  style={[styles.segmentText, direction === 'check_in' && styles.segmentTextActive]}
                >
                  Ingreso
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  direction === 'check_out' && styles.segmentButtonActive,
                ]}
                onPress={() => dispatch(setScanDirection('check_out'))}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    direction === 'check_out' && styles.segmentTextActive,
                  ]}
                >
                  Egreso
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.infoBanner,
                {
                  backgroundColor:
                    direction === 'check_in' ? theme.colors.primary : theme.colors.blue,
                },
              ]}
            >
              <Feather name="info" size={14} color="white" />
              <ThemedText style={styles.infoBannerText}>
                Estás por registrar un{' '}
                <ThemedText style={styles.infoBannerBold}>
                  {direction === 'check_in' ? 'ingreso' : 'egreso'}
                </ThemedText>
              </ThemedText>
            </View>
          </>
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.checkInTitle}>
            Registrá un ingreso
          </ThemedText>
        )}
      </View>

      {/* Camera section */}
      <View
        style={[styles.cameraSection, { marginBottom: insets.bottom + 24 }]}
        onLayout={(e) => {
          setCameraHeight(e.nativeEvent.layout.height);
          setCameraWidth(e.nativeEvent.layout.width);
        }}
      >
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          enableTorch={torchEnabled}
          onBarcodeScanned={handleScannedCode}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        <View style={StyleSheet.absoluteFillObject}>
          <Overlay cameraWidth={cameraWidth} cameraHeight={cameraHeight} />
        </View>

        <View style={styles.hintContainer}>
          <ThemedText style={styles.hintText}>Acercá el celular al código QR</ThemedText>
        </View>

        <View style={styles.flashlightContainer}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => {
              const next = !torchEnabled;
              trackEvent(TrackingEvents.FLASHLIGHT_TOGGLED, {
                flashlight_state: next ? 'on' : 'off',
              });
              setTorchEnabled(next);
            }}
          >
            {torchEnabled ? <Flashlight /> : <FlashlightOff />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // paddingHorizontal: 16,
  },
  topSection: {
    backgroundColor: 'white',
    paddingBottom: 12,
  },
  connectionBanner: {
    marginHorizontal: 24,
    marginBottom: 8,
  },
  checkInTitle: {
    fontSize: 24,
    paddingHorizontal: 24,
    marginTop: 24,
    lineHeight: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: '#1D252D',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'black',
    opacity: 0.6,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  segmentedWrapper: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  segmentButtonActive: {
    borderColor: theme.colors.blue,
  },
  segmentText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.grayText,
  },
  segmentTextActive: {
    color: theme.colors.blue,
    fontFamily: theme.typography.fonts.bold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  infoBannerText: {
    color: 'white',
    fontSize: theme.typography.sizes.sm,
    flex: 1,
  },
  infoBannerBold: {
    color: 'white',
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.bold,
  },
  cameraSection: {
    width: cameraWidth,
    flex: 1,
    maxHeight: cameraWidth / 0.58,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hintContainer: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: 'white',
    fontSize: theme.typography.sizes.sm,
  },
  flashlightContainer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  roundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

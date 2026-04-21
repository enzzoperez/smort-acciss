import { useEffect, useRef, useState } from 'react';
import { AppState, StatusBar, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Overlay } from './overlay';
import Flashlight from '@/assets/svg/flashlight.svg';
import FlashlightOff from '@/assets/svg/flashlight-off.svg';
import BackButtonCamera from '@/assets/svg/back-button-camera.svg';
import { logError } from '@/libs/crashlytics';
import { useNetwork } from '@/providers/network-provider';
import Cloud from '@/assets/svg/cloud.svg';
import CloudOff from '@/assets/svg/cloud-off.svg';
import { useAppSelector } from '@/libs/redux';
import { ThemedText } from '@/components/themed-text';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';
import { useDb } from '@/hooks/use-db';
import { getAllScannedTickets } from '@/db/repositories/valid-tickets.repository';
import { getEventSync } from '@/db/repositories/events-sync.repository';

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.infoSheetStatItem}>
      <ThemedText type="title" style={styles.infoSheetStatNumber}>
        {value}
      </ThemedText>
      <ThemedText style={styles.infoSheetStatLabel}>{label}</ThemedText>
    </View>
  );
}

export default function CameraScreen() {
  const router = useRouter();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [myScans, setMyScans] = useState(0);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [infoSheetHeight, setInfoSheetHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const { selectedEventConfig, totalAssigned, selectedEvent } = useAppSelector(
    (state) => state.config,
  );
  const { userData } = useAppSelector((state) => state.user);
  const { db } = useDb();

  const totalPending = totalAssigned != null ? totalAssigned - myScans : null;

  const getEventNameAndDate = (): { name: string; date: string } => {
    const match = selectedEventConfig?.eventName?.match(/^\((.+?)\)\s*(.+)$/);
    return {
      date: match?.[1] ?? 'Fecha no disponible',
      name: match?.[2] ?? selectedEventConfig?.eventName ?? '',
    };
  };
  const { name: eventName, date: eventDateTime } = getEventNameAndDate();

  const headerStyle = [styles.header, { paddingTop: insets.top + 8 }];
  const bottomButtonsStyle = [
    styles.bottomButtons,
    { bottom: infoSheetHeight > 0 ? infoSheetHeight + 16 : insets.bottom + 24 },
  ];
  const infoSheetStyle = [styles.infoSheet, { paddingBottom: insets.bottom + 16 }];

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
    if (!db) return;
    getAllScannedTickets(db).then((scans) => setMyScans(scans.length));
  }, [db]);

  useEffect(() => {
    if (!db || !selectedEvent || !userData?.accountId) return;
    getEventSync(db, selectedEvent, userData.accountId).then((sync) =>
      setLastSyncDate(sync?.lastSyncDate ?? null),
    );
  }, [db, selectedEvent, userData?.accountId]);

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

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        onBarcodeScanned={handleScannedCode}
      />

      <Overlay />

      {/* Header */}
      <View style={headerStyle} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText type="title" style={styles.headerTitle} numberOfLines={1}>
              {eventName}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>{eventDateTime}</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerButton}>{isOnline ? <Cloud /> : <CloudOff />}</View>
          </View>
        </View>
      </View>

      {/* Offline banner */}
      {isOnline && headerHeight > 0 && (
        <View style={[styles.offlineBanner, { top: headerHeight + 8 }]}>
          <ConnectionStatusBanner isOnline={isOnline} lastSyncDate={lastSyncDate} />
        </View>
      )}

      {/* Info sheet */}
      <View
        style={infoSheetStyle}
        onLayout={(e) => setInfoSheetHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.infoSheetStats}>
          <StatItem label="Total asignados" value={totalAssigned ?? '-'} />
          <StatItem label="Total pendientes" value={totalPending ?? '-'} />
          <StatItem label="Mis escaneos" value={myScans} />
        </View>
      </View>

      <View style={bottomButtonsStyle}>
        <TouchableOpacity style={styles.roundButton} onPress={() => router.back()}>
          <BackButtonCamera />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => setTorchEnabled((prev) => !prev)}
        >
          {torchEnabled ? <Flashlight /> : <FlashlightOff />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 10,
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
  },
  infoSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 10,
  },
  infoSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00000020',
    marginBottom: 16,
  },
  infoSheetClose: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
  },
  infoSheetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  infoSheetStatItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoSheetStatNumber: {
    color: '#1D252D',
    fontSize: 14,
  },
  infoSheetStatLabel: {
    color: '#1D252D',
    opacity: 0.6,
    fontSize: 14,
    textAlign: 'center',
  },
  infoSheetLastSync: {
    color: '#1D252D',
    opacity: 0.5,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
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
  offlineBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
});

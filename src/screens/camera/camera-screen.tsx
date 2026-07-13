import { StatusBar, View, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Overlay } from './overlay';
import Flashlight from '@/assets/svg/flashlight.svg';
import FlashlightOff from '@/assets/svg/flashlight-off.svg';
import BackButtonCamera from '@/assets/svg/back-button-camera.svg';
import Download from '@/assets/svg/download.svg';
import Cloud from '@/assets/svg/cloud.svg';
import CloudOff from '@/assets/svg/cloud-off.svg';
import { ThemedText } from '@/components/themed-text';
import { ConnectionStatusBanner } from '@/components/connection-status-banner';
import { useCameraScreen } from './use-camera-screen';

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
  const {
    torchEnabled,
    myScans,
    totalPending,
    totalAssigned,
    headerHeight,
    setHeaderHeight,
    infoSheetHeight,
    setInfoSheetHeight,
    isOnline,
    lastSyncDate,
    eventName,
    eventDateTime,
    handleDownload,
    handleScannedCode,
    handleToggleTorch,
    handleBack,
  } = useCameraScreen();

  const insets = useSafeAreaInsets();
  const headerStyle = [styles.header, { paddingTop: insets.top + 8 }];
  const bottomButtonsStyle = [
    styles.bottomButtons,
    { bottom: infoSheetHeight > 0 ? infoSheetHeight + 16 : insets.bottom + 24 },
  ];
  const infoSheetStyle = [styles.infoSheet, { paddingBottom: insets.bottom + 16 }];

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
            {isOnline && (
              <TouchableOpacity style={styles.headerButton} onPress={handleDownload}>
                <Download width={24} height={24} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {!isOnline && (
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
        <TouchableOpacity style={styles.roundButton} onPress={handleBack}>
          <BackButtonCamera />
        </TouchableOpacity>

        <TouchableOpacity style={styles.roundButton} onPress={handleToggleTorch}>
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

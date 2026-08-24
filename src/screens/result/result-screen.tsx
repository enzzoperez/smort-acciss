import React from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import Layer from '@/components/layer';
import { useResultScreen } from './use-result-screen';
import { theme } from '@/themes/theme';
import { formatDateAndHour } from '@/utils/dates-utils';

const ResultScreen = () => {
  const {
    infoUsedData,
    getScreenElements,
    handleGoHome,
    handleScanQr,
    scannedCode,
    isLoadingRequest,
    isGoingHome,
  } = useResultScreen();

  if (!scannedCode) {
    return (
      <Layer>
        <View style={styles.loadingContainer}>
          <ThemedText type="title" style={styles.resultText}>
            No se proporcionó ningún código QR.
          </ThemedText>
        </View>
      </Layer>
    );
  }

  if (isLoadingRequest) {
    return (
      <Layer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
          <ThemedText type="title" style={styles.resultText}>
            Validando QR...
          </ThemedText>
        </View>
      </Layer>
    );
  }

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} translucent={false} />

      <View style={styles.container}>
        <View style={styles.iconRow}>
          {getScreenElements().mainIcon}

          <ThemedText type="title" style={styles.resultText}>
            {getScreenElements().title}
          </ThemedText>

          <ThemedText type="default" style={styles.descriptionError}>
            {getScreenElements().message}
          </ThemedText>
        </View>

        {getScreenElements().actionLabel}

        {infoUsedData && (
          <View style={styles.infoSection}>
            <View>
              <ThemedText style={{ color: theme.colors.grayText }}>
                Fecha y hora de escaneo:
              </ThemedText>
              <ThemedText type="title" style={styles.infoValue}>
                {infoUsedData?.data?.lastScanDate
                  ? formatDateAndHour(new Date(infoUsedData?.data?.lastScanDate))
                  : '-'}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={{ color: theme.colors.grayText }}>Operador:</ThemedText>
              <ThemedText type="title" style={styles.infoValue}>
                {infoUsedData?.data?.lastScanSource || 'Desconocido'}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <UiButton
          variant="tertiary"
          text="Escanear otro código QR"
          onPress={handleScanQr}
          disabled={isGoingHome}
        />
        <UiButton
          variant="secondary"
          text="Ir al inicio"
          onPress={handleGoHome}
          loading={isGoingHome}
        />
      </View>
    </Layer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRow: {
    gap: 32,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 40,
    textAlign: 'center',
  },
  descriptionError: {
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
  },
  codeError: {
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 32,
    width: '100%',
    gap: 12,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.grayText,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
    paddingVertical: 24,
  },
});

export default ResultScreen;

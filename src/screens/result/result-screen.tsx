import React from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import Layer from '@/components/layer';
import { useResultScreen } from './use-result-screen';

const ResultScreen = () => {
  const { getScreenElements, handleGoHome, handleScanQr, scannedCode, isLoadingRequest } =
    useResultScreen();

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
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText type="title" style={styles.resultText}>
            Validando QR...
          </ThemedText>
        </View>
      </Layer>
    );
  }

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />

      <View style={styles.container}>
        <View style={{ gap: 32, alignItems: 'center' }}>
          {getScreenElements().mainIcon}

          <ThemedText type="title" style={styles.resultText}>
            {getScreenElements().title}
          </ThemedText>

          <ThemedText type="default" style={styles.descriptionError}>
            {getScreenElements().message}
          </ThemedText>
        </View>

        {getScreenElements().actionLabel}
      </View>

      <View
        style={{
          width: '100%',
          gap: 10,
          paddingVertical: 24,
        }}
      >
        <UiButton variant="tertiary" text="Escanear otro código QR" onPress={handleScanQr} />

        <UiButton variant="secondary" text="Ir al inicio" onPress={handleGoHome} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 40,
    textAlign: 'center',
  },
  descriptionError: {
    fontSize: 16,
    textAlign: 'center',
  },

  codeError: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'light',
  },
});

export default ResultScreen;

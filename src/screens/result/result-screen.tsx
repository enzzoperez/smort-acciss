import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import Layer from '@/components/layer';
import { useValidateAndRegisterMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';
import { ActionLabel } from './action-label';

import CheckAccess from '@/assets/svg/check-access.svg';
import ScanAccess from '@/assets/svg/scan-access.svg';

import { getReadErrorByCode } from '@/utils/get-error-result';
import { useNetwork } from '@/providers/network-provider';
import { saveQrOffline } from '@/storage/qr-storage';
import { useSyncOfflineData } from '@/hooks/use-sync-offline-data';

const ResultScreen = () => {
  const router = useRouter();
  const { scannedCode } = useLocalSearchParams();
  const { selectedEvent, verifyOnly } = useAppSelector((state) => state.config);

  const { isOnline } = useNetwork();
  const onlineSnapshotRef = useRef(isOnline);

  const { sync } = useSyncOfflineData();

  const [
    validateAndRegister,
    { isLoading: isLoadingRequest, error: errorRequest, isSuccess: isSuccessRequest },
  ] = useValidateAndRegisterMutation();

  const [errorNetwork, setErrorNetwork] = useState<boolean>(false);

  const errorItem = getReadErrorByCode({
    code: errorRequest?.data?.errors[0]?.code,
    isConnected: onlineSnapshotRef.current,
  });

  useEffect(() => {
    const processQr = async () => {
      if (!scannedCode) return;

      const online = onlineSnapshotRef.current;
      if (!online) {
        await saveQrOffline(scannedCode as string);
        setErrorNetwork(true);
        return;
      }

      try {
        await sync();
        await validateAndRegister({
          eventCode: selectedEvent!,
          qrCode: scannedCode as string,
        });
      } catch (error) {
        console.error('Error validando QR:', error);
      }
    };

    processQr();
  }, [scannedCode]);

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
          {errorItem && errorItem?.icon}
          {isSuccessRequest && verifyOnly && <CheckAccess />}
          {isSuccessRequest && !verifyOnly && <ScanAccess />}

          {errorItem && (
            <>
              <ThemedText type="title" style={styles.resultText}>
                {errorItem?.title}
              </ThemedText>

              <ThemedText type="default" style={styles.descriptionError}>
                {errorItem?.message}
              </ThemedText>
            </>
          )}

          {isSuccessRequest && (
            <ThemedText type="title" style={styles.resultText}>
              {verifyOnly ? 'Acceso confirmado' : 'Acceso confirmado y quemado'}
            </ThemedText>
          )}
        </View>

        <ActionLabel type={errorItem && !errorNetwork ? 'error' : 'success'} />
      </View>

      <View
        style={{
          width: '100%',
          gap: 10,
          paddingVertical: 24,
        }}
      >
        <UiButton
          variant="tertiary"
          text="Escanear otro código QR"
          onPress={() => {
            router.replace('/camera');
          }}
        />

        <UiButton
          variant="secondary"
          text="Ir al inicio"
          onPress={() => {
            router.replace('/select-events');
          }}
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
});

export default ResultScreen;

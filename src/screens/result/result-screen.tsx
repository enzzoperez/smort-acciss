import React, { useEffect } from 'react';
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

const ResultScreen = () => {
  const router = useRouter();
  const { scannedCode } = useLocalSearchParams();
  const { selectedEvent, verifyOnly } = useAppSelector((state) => state.config);
  const [
    validateAndRegister,
    {
      isLoading: loadingRegister,
      isError: isErrorRegister,
      error: errorRegister,
      isSuccess: successRegister,
    },
  ] = useValidateAndRegisterMutation();

  const isLoadingRequest = loadingRegister;
  const isErrorRequest = isErrorRegister;
  const errorRequest = errorRegister;
  const isSuccessRequest = successRegister;

  const errorItem = getReadErrorByCode(errorRequest?.data?.errors[0]?.code);

  useEffect(() => {
    const validateAndRegisterQr = async () => {
      await validateAndRegister({
        eventCode: selectedEvent as string,
        qrCode: scannedCode as string,
      });
    };

    if (scannedCode) {
      validateAndRegisterQr();
    }
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
          {isErrorRequest && errorItem?.icon}
          {isSuccessRequest && verifyOnly && <CheckAccess />}
          {isSuccessRequest && !verifyOnly && <ScanAccess />}

          {isErrorRequest && (
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

        <ActionLabel type={isErrorRequest ? 'error' : 'success'} />
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

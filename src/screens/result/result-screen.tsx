import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import OcticonsIcons from '@expo/vector-icons/Octicons';
import Layer from '@/components/layer';
import { useValidateAndRegisterMutation, useValidateOnlyMutation } from '@/api/scanner-api';
import { useAppSelector } from '@/libs/redux';

const ResultScreen = () => {
  const router = useRouter();
  const { scannedCode } = useLocalSearchParams();
  const { selectedEvent, verifyOnly } = useAppSelector((state) => state.config);
  const [validateOnly, { isLoading, isError, error }] = useValidateOnlyMutation();
  const [
    validateAndRegister,
    { isLoading: loadingRegister, isError: isErrorRegister, error: errorRegister },
  ] = useValidateAndRegisterMutation();

  const isLoadingRequest = isLoading || loadingRegister;
  const isErrorRequest = isError || isErrorRegister;
  const errorRequest = error || errorRegister;

  useEffect(() => {
    const validateQr = async () => {
      await validateOnly({ eventCode: selectedEvent as string, qrCode: scannedCode as string });
    };

    const validateAndRegisterQr = async () => {
      await validateAndRegister({
        eventCode: selectedEvent as string,
        qrCode: scannedCode as string,
      });
    };

    if (scannedCode) {
      if (verifyOnly) {
        validateQr();
      } else {
        validateAndRegisterQr();
      }
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
      <View style={styles.container}>
        <View style={{ gap: 32, alignItems: 'center' }}>
          {isErrorRequest ? (
            <OcticonsIcons name="x-circle-fill" size={140} color={'red'} />
          ) : (
            <OcticonsIcons name="check-circle-fill" size={140} color={'green'} />
          )}

          {isErrorRequest && (
            <ThemedText type="title" style={styles.resultText}>
              {errorRequest && errorRequest?.data?.errors[0]?.message}
            </ThemedText>
          )}
        </View>

        <View style={{ width: '100%', gap: 16 }}>
          <UiButton
            variant="tertiary"
            text="Escanear otro"
            onPress={() => {
              router.replace('/camera');
            }}
          />

          <UiButton
            variant="secondary"
            text="Ir al Home"
            onPress={() => {
              router.replace('/select-events');
            }}
          />
        </View>
      </View>
    </Layer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
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
    fontSize: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default ResultScreen;

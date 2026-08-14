import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { appVersion, isIos } from '@/utils/device-utils';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import DocumentIdInput from '@/components/document-id-input';
import MainLogo from '@/assets/svg/main-logo.svg';
import Layer from '@/components/layer';
import PoweredByItti from '@/assets/svg/powered-by-itti.svg';
import { useLoginScreen } from './use-login-screen';

const LoginScreen = () => {
  const {
    isLoading,
    documentType,
    setDocumentType,
    setDocumentValue,
    observation,
    setObservation,
    code,
    handleCodeChange,
    handleLoginRequest,
  } = useLoginScreen();

  if (isLoading) {
    return (
      <Layer>
        <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText>Cargando configuracion</ThemedText>
        </View>
      </Layer>
    );
  }

  const Buttons = () => (
    <View style={{ marginTop: 16 }}>
      <UiButton
        disabled={isLoading}
        variant="primary"
        text="Ingresar"
        onPress={handleLoginRequest}
      />
    </View>
  );

  return (
    <Layer>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={false} />
      <ScrollView
        style={[{ flex: 1 }]}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          style={styles.avoidingStyle}
          behavior={isIos() ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MainLogo />
            </View>
            <View style={styles.formContainer}>
              <ThemedText type="subtitle" style={{ fontSize: 22 }}>
                Iniciar sesión
              </ThemedText>
              <DocumentIdInput
                documentType={documentType}
                onChangeDocumentType={setDocumentType}
                onChangeText={(text) => setDocumentValue(text)}
                placeholder="Número de documento"
                label="Documento"
              />

              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                  Observacion
                </ThemedText>
                <TextInput
                  placeholder="Observacion"
                  style={styles.input}
                  placeholderTextColor="#7A7A7A"
                  value={observation}
                  onChangeText={setObservation}
                />
              </View>
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                  Codigo
                </ThemedText>
                <TextInput
                  placeholder="Codigo"
                  style={styles.input}
                  placeholderTextColor="#7A7A7A"
                  autoCapitalize="characters"
                  value={code}
                  onChangeText={handleCodeChange}
                />
              </View>
              <Buttons />
            </View>
          </View>
        </KeyboardAvoidingView>

        <View style={{ alignItems: 'center' }}>
          <PoweredByItti />
          <ThemedText type="default" style={{ color: 'black', fontSize: 12 }}>
            {appVersion}
          </ThemedText>
        </View>
      </ScrollView>
    </Layer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  avoidingStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  formContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  field: {
    gap: 4,
  },
  input: {
    fontFamily: 'UenoLogicalBook',
    color: 'black',
    height: 48,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderColor: '#DCE1E8',
    borderWidth: 1,
    fontSize: 16,
  },
});

export default LoginScreen;

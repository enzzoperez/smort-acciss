import React, { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { appVersion, isIos } from '@/utils/device-utils';
import { KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import DocumentIdInput from '@/components/document-id-input';
import MainLogo from '@/assets/svg/main-logo.svg';
import Layer from '@/components/layer';
import PoweredByItti from '@/assets/svg/powered-by-itti.svg';
import { Feather } from '@expo/vector-icons';
import PressableOpacity from '@/components/pressable-opacity';
import { useLoginScreen } from './use-login-screen';

const LoginScreen = () => {
  const {
    isLoading,
    documentType,
    setDocumentType,
    documentValue,
    setDocumentValue,
    observation,
    setObservation,
    code,
    handleCodeChange,
    handleLoginRequest,
  } = useLoginScreen();
  const [codeVisible, setCodeVisible] = useState(false);

  const isSubmitDisabled = !documentValue.trim() || !code.trim();

  const Buttons = () => (
    <View style={{ marginTop: 16 }}>
      <UiButton
        disabled={isSubmitDisabled}
        loading={isLoading}
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

              <View style={[styles.field, { position: 'relative' }]}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                  Pin
                </ThemedText>
                <TextInput
                  placeholder="Pin"
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholderTextColor="#7A7A7A"
                  autoCapitalize="characters"
                  secureTextEntry={!codeVisible}
                  value={code}
                  onChangeText={handleCodeChange}
                />
                <PressableOpacity
                  onPress={() => setCodeVisible((prev) => !prev)}
                  style={styles.iconContainer}
                >
                  <Feather name={codeVisible ? 'eye-off' : 'eye'} size={20} color="#7A7A7A" />
                </PressableOpacity>
              </View>

              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14, marginTop: 12 }}>
                  Observación (opcional)
                </ThemedText>
                <TextInput
                  placeholder="Observación (opcional)"
                  style={styles.input}
                  placeholderTextColor="#7A7A7A"
                  value={observation}
                  onChangeText={setObservation}
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
  avoidingStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  formContainer: {
    width: '100%',
    gap: 12,
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
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: 40,
  },
});

export default LoginScreen;

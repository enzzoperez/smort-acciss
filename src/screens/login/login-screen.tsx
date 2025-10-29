import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { useAppTranslation } from '@/libs/i18n';
import { appVersion, isIos } from '@/utils/device-utils';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import { TextInput } from 'react-native-gesture-handler';
import PhoneNumberInput from '@/components/phone-number-input';

const a =
  'https://images.unsplash.com/photo-1590721791974-d6c8ca43f6bc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987';

const LoginScreen = () => {
  const { t } = useAppTranslation(['commons']);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [phoneNumber, setPhoneNumber] = useState('');

  const insets = useSafeAreaInsets();

  const isPermissionGranted = Boolean(permission?.granted);

  const handleFastPass = () => {
    router.push('/camera');
  };

  const Buttons = () => (
    <View>
      <UiButton
        disabled={!isPermissionGranted}
        variant="secondary"
        text={t('commons:buttons.login')}
        onPress={handleFastPass}
      />
    </View>
  );

  useEffect(() => {
    if (!isPermissionGranted) {
      requestPermission();
    }
  }, [isPermissionGranted]);

  return (
    <ImageBackground
      source={{
        uri: a,
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        style={[styles.overlay, { paddingBottom: insets.bottom }]}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          style={styles.avoidingStyle}
          behavior={isIos() ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <PhoneNumberInput
                onChangeText={(text) => setPhoneNumber(text)}
                value={phoneNumber}
                placeholder="Número de teléfono"
              />

              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#7A7A7A"
              />
            </View>

            <Buttons />
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText type="subtitle" style={{ color: 'white', fontSize: 12 }}>
              {appVersion}
            </ThemedText>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  avoidingStyle: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    gap: 50,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'flex-end',
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 48,
    lineHeight: 48,
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 16,
  },
  bold: {
    color: 'white',
    fontSize: 20,
  },
  buttonPrimary: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimaryText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    borderColor: 'white',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderColor: '#D5E3F0',
    borderWidth: 1,
    fontSize: 16,
  },
});

export default LoginScreen;

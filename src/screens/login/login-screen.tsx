import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { useAppTranslation } from '@/libs/i18n';
import { appVersion, isIos } from '@/utils/device-utils';
import { ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import { TextInput } from 'react-native-gesture-handler';
import PhoneNumberInput from '@/components/phone-number-input';
import { useLoginMutation } from '@/api/auth-api';
import { setAccessToken, setRefreshToken, setUserData } from '@/store/slices';
import { useAppDispatch } from '@/libs/redux';
import { useApiErrorHandler } from '@/components/useErrorHandler';
import LogoTuti from '@/assets/svg/LogoTuti.svg';

const a =
  'https://images.unsplash.com/photo-1590721791974-d6c8ca43f6bc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987';

const LoginScreen = () => {
  const { t } = useAppTranslation(['commons']);
  const dispatch = useAppDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const [login, { isLoading }] = useLoginMutation();
  const { apiErrorHandler } = useApiErrorHandler();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const isPermissionGranted = Boolean(permission?.granted);

  const handleLoginRequest = async () => {
    try {
      const data = await login({
        accountCredentialType: 'PHONE_NUMBER',
        accountCredentialValue: phoneNumber,
        password: password,
      }).unwrap();

      const { tokens, ...userWithoutTokens } = data;

      dispatch(setAccessToken(tokens.accessToken));
      dispatch(setRefreshToken(tokens.refreshToken));
      dispatch(setUserData(userWithoutTokens));
    } catch (error) {
      apiErrorHandler(error);
    }
  };

  const Buttons = () => (
    <View>
      <UiButton
        disabled={isLoading}
        variant="primary"
        text="Ingresar"
        onPress={handleLoginRequest}
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
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <LogoTuti />
            </View>
            <View style={styles.formContainer}>
              <PhoneNumberInput
                onChangeText={(text) => setPhoneNumber(text)}
                // value={phoneNumber}
                placeholder="Número de teléfono"
              />

              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#7A7A7A"
                onChangeText={(text) => {
                  setPassword(text);
                }}
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
    fontFamily: 'UenoLogical-Book',
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

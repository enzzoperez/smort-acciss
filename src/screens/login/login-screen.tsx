import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { appVersion, isIos } from '@/utils/device-utils';
import { KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { TextInput } from 'react-native-gesture-handler';
import PhoneNumberInput from '@/components/phone-number-input';
import { useLoginMutation } from '@/api/auth-api';
import { setAccessToken, setRefreshToken, setUserData } from '@/store/slices';
import { useAppDispatch } from '@/libs/redux';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { TrackingEvents } from '@/constants/tracking-events';
import { trackEvent } from '@/libs/tracking';
import MainLogo from '@/assets/svg/main-logo.svg';
import Layer from '@/components/layer';
import { Feather } from '@expo/vector-icons';
import PressableOpacity from '@/components/pressable-opacity';
import PoweredByItti from '@/assets/svg/powered-by-itti.svg';

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const [login, { isLoading }] = useLoginMutation();
  const { apiErrorHandler } = useApiErrorHandler();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPermissionGranted = Boolean(permission?.granted);

  const handleLoginRequest = async () => {
    trackEvent(TrackingEvents.LOGIN_BUTTON_PRESSED);
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
              <PhoneNumberInput
                onChangeText={(text) => setPhoneNumber(text)}
                placeholder="Número de teléfono"
                label="Número de teléfono"
              />

              <View style={{ position: 'relative', marginBottom: 16 }}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                  Contraseña
                </ThemedText>
                <TextInput
                  placeholder="Contraseña"
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  placeholderTextColor="#7A7A7A"
                  onChangeText={(text) => setPassword(text)}
                />
                <PressableOpacity
                  onPress={() => setPasswordVisible((prev) => !prev)}
                  style={styles.iconContainer}
                >
                  <Feather name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#7A7A7A" />
                </PressableOpacity>
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
    gap: 16,
    marginBottom: 48,
  },
  input: {
    fontFamily: 'UenoLogicalBook',
    color: 'black',
    height: 45,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderColor: '#DCE1E8',
    borderWidth: 1,
    fontSize: 16,
    paddingRight: 40,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: 32,
  },
});

export default LoginScreen;

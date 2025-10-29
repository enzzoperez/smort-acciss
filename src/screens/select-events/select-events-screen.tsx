import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { useAppTranslation } from '@/libs/i18n';
import { appVersion } from '@/utils/device-utils';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogoutMutation } from '@/api/auth-api';
import { useAppDispatch, useAppSelector } from '@/libs/redux';
import { resetUserData, setLogout } from '@/store/slices';

const SelectEventsScreen = () => {
  const { t } = useAppTranslation(['home']);
  const { userData } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [logout] = useLogoutMutation();

  const closeSession = () => {
    logout({ accountId: userData?.accountId });
    dispatch(setLogout());
    dispatch(resetUserData());
  };

  const Buttons = () => (
    <View>
      <UiButton variant="secondary" text={t('home:buttonFastPass')} onPress={closeSession} />
    </View>
  );

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1015',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
        <View style={styles.container}>
          <View style={{ marginBottom: 32 }}>
            <ThemedText type="title" style={styles.title}>
              {t('home:title')}
            </ThemedText>
            <ThemedText style={styles.subtitle}>{t('home:subtitle')}</ThemedText>
          </View>

          <Buttons />
        </View>
        <View style={{ alignItems: 'center' }}>
          <ThemedText type="subtitle" style={{ color: 'white', fontSize: 12 }}>
            {appVersion}
          </ThemedText>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
});

export default SelectEventsScreen;

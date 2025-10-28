import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { useAppTranslation } from '@/libs/i18n';
import { appVersion } from '@/utils/device-utils';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';

const SelectEventsScreen = () => {
  const { t } = useAppTranslation(['home']);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

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
        text={t('home:buttonFastPass')}
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
      source={require('@/assets/images/shakira-hero.jpg')}
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

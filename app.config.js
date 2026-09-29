import fs from 'fs';
import path from 'path';
import { version } from './package.json';

const UPDATES_URL = 'https://u.expo.dev/280698c6-1aef-4499-9d65-7bcae8874e56';

const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }) => {
  // ---------- ANDROID ----------
  if (process.env.GOOGLE_SERVICES_JSON && fs.existsSync(process.env.GOOGLE_SERVICES_JSON)) {
    const target = path.resolve('android/app/google-services.json');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(process.env.GOOGLE_SERVICES_JSON, target);
  }

  if (process.env.GOOGLE_SERVICES_JSON_DEV && fs.existsSync(process.env.GOOGLE_SERVICES_JSON_DEV)) {
    const target = path.resolve('android/app/src/development/google-services.json');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(process.env.GOOGLE_SERVICES_JSON_DEV, target);
  }

  // ---------- IOS ----------
  if (
    process.env.GOOGLE_SERVICE_INFO_PLIST &&
    fs.existsSync(process.env.GOOGLE_SERVICE_INFO_PLIST)
  ) {
    const target = path.resolve('ios/tutismartaccess/GoogleService-Info.plist');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(process.env.GOOGLE_SERVICE_INFO_PLIST, target);
  }

  return {
    ...config,

    name: 'tuti-smart-access',
    slug: 'tuti-smart-access',
    version,
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'tutiqrreader',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    platforms: ['ios', 'android'],

    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.itti.tuti.smartaccess',
      appleTeamId: '83W9P2X5SX',
      googleServicesFile: './ios/tutismartaccess/GoogleService-Info.plist',
    },

    android: {
      package: IS_DEV ? 'com.itti.tuti.smartaccess.dev' : 'com.itti.tuti.smartaccess',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      adaptiveIcon: {
        foregroundImage: './src/assets/images/android-icon-foreground.png',
        backgroundColor: '#ffffff',
      },
      googleServicesFile: './android/app/google-services.json',
    },

    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
      'expo-router',
      [
        'expo-camera',
        {
          cameraPermission: '$(PRODUCT_NAME) necesita acceso a tu cámara para escanear códigos QR.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#FFFFFF',
          dark: {
            backgroundColor: '#FFFFFF',
          },
        },
      ],
      [
        'expo-sqlite',
        {
          useSQLCipher: true,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            // Evita el conflicto de libcrypto.so entre SQLCipher y react-native-quick-crypto
            packagingOptions: {
              pickFirst: ['**/libcrypto.so'],
            },
          },
        },
      ],
    ],

    runtimeVersion: version,

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: '280698c6-1aef-4499-9d65-7bcae8874e56',
      },
    },

    updates: {
      url: UPDATES_URL,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },

    owner: 'itti-platform',
  };
};

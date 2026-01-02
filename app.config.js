import fs from 'fs';
import path from 'path';

export default ({ config }) => {
  // ---------- ANDROID ----------
  if (process.env.GOOGLE_SERVICES_JSON) {
    const androidPath = path.resolve('android/app/google-services.json');

    fs.mkdirSync(path.dirname(androidPath), { recursive: true });
    fs.writeFileSync(androidPath, process.env.GOOGLE_SERVICES_JSON);
  }

  // ---------- IOS ----------
  if (process.env.GOOGLE_SERVICE_INFO_PLIST) {
    const iosPath = path.resolve('ios/GoogleService-Info.plist');

    fs.mkdirSync(path.dirname(iosPath), { recursive: true });
    fs.writeFileSync(iosPath, process.env.GOOGLE_SERVICE_INFO_PLIST);
  }

  return {
    ...config,

    name: 'tuti-smart-access',
    slug: 'tuti-smart-access',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'tutiqrreader',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.itti.tuti.smartaccess',
      appleTeamId: '83W9P2X5SX',
      googleServicesFile: './ios/GoogleService-Info.plist',
    },

    android: {
      package: 'com.itti.tuti.smartaccess',
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
    ],

    runtimeVersion: {
      policy: 'appVersion',
    },

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: '280698c6-1aef-4499-9d65-7bcae8874e56',
      },
    },

    owner: 'itti-platform',
  };
};

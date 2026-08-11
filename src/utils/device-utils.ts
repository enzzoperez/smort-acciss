import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { version } from '../../package.json';

function buildAppVersionLabel(): string {
  const base = `v${version}`;

  if (Updates.isEmbeddedLaunch || !Updates.updateId) {
    return base;
  }

  return `${base}-${Updates.updateId.split('-')[0]}`;
}

export const appVersion = buildAppVersionLabel();

export const isIos = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';

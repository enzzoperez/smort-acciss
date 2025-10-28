import { Platform } from 'react-native';
import { version } from '../../package.json';

export const appVersion = `v${version}`;

export const isIos = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';

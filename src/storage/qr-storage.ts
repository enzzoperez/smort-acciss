import { formatDateWithOffset } from '@/utils/dates-utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const KEY = 'offline_qr_queue';

export async function saveQrOffline(qr: string) {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    let list = [];

    if (existing) {
      list = JSON.parse(existing);
    }

    list.push({
      qrCode: qr,
      timeScan: formatDateWithOffset(new Date()),
    });

    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch (error) {
    Alert.alert('Error', `No se pudo guardar el ticket: ${error}`);
  }
}

export async function clearOfflineQueue() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (error) {
    console.error('Error limpiando cola offline', error);
  }
}

import React from 'react';
import { View, StyleSheet } from 'react-native';
import CheckCircle from '@/assets/svg/check-circle.svg';
import WifiOff from '@/assets/svg/wifi-off.svg';
import { ThemedText } from './themed-text';
import { formatSyncTime } from '@/utils/dates-utils';

type Props = {
  isOnline: boolean;
  lastSyncDate?: string | null;
};

export const ConnectionStatusBanner = ({ isOnline, lastSyncDate }: Props) => {
  const containerStyle = isOnline ? styles.onlineContainer : styles.offlineContainer;

  const title = isOnline ? 'Tickets sincronizados en la base local.' : 'Sin conexión.';

  const formattedDate = lastSyncDate ? formatSyncTime(lastSyncDate) : '-';
  const subtitle = isOnline
    ? `Última actualización: ${formattedDate}`
    : `Usando datos de la base local. Última actualización: ${formattedDate}`;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconContainer}>
        {isOnline ? <CheckCircle width={24} height={24} /> : <WifiOff width={24} height={24} />}
      </View>

      <View style={styles.textContainer}>
        <ThemedText
          type="title"
          style={[styles.title, isOnline ? styles.onlineText : styles.offlineText]}
        >
          {title}
        </ThemedText>

        <ThemedText style={[styles.subtitle, isOnline ? styles.onlineText : styles.offlineText]}>
          {subtitle}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },

  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 14,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },

  onlineContainer: {
    backgroundColor: '#DCEFE3',
    borderColor: '#2E7D32',
  },

  offlineContainer: {
    backgroundColor: '#F4E1DF',
    borderColor: '#A13328',
  },

  onlineText: {
    color: '#1B5E20',
  },

  offlineText: {
    color: '#8B1E16',
  },
});

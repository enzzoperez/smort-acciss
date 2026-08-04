import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import CloseSession from '@/assets/svg/close-session.svg';
import HeaderLogo from '@/assets/svg/logo-header.svg';
import Download from '@/assets/svg/download.svg';
import PressableOpacity from './pressable-opacity';
import Cloud from '@/assets/svg/cloud.svg';
import CloudOff from '@/assets/svg/cloud-off.svg';

import { useNetwork } from '@/providers/network-provider';

interface HeaderProps {
  onRightPress?: () => void;
  onDownload?: () => void;
  hasSelectedEvent?: boolean;
  isLoggingOut?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRightPress,
  onDownload,
  hasSelectedEvent,
  isLoggingOut,
}) => {
  const { isOnline } = useNetwork();
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.leftContainer}>
        <HeaderLogo />
      </View>

      {/* Right icons */}
      <View style={styles.rightContainer}>
        {isOnline ? <Cloud /> : <CloudOff />}

        {isOnline && hasSelectedEvent && (
          <PressableOpacity styleAnimated={styles.rightIcon} onPress={onDownload}>
            <Download width={24} height={24} />
          </PressableOpacity>
        )}

        <PressableOpacity
          styleAnimated={styles.rightIcon}
          onPress={isLoggingOut ? undefined : onRightPress}
        >
          {isLoggingOut ? <ActivityIndicator size="small" /> : <CloseSession />}
        </PressableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  rightIcon: {
    justifyContent: 'center',
  },
});

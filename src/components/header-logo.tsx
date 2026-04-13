import React from 'react';
import { View, StyleSheet } from 'react-native';
import CloseSession from '@/assets/svg/close-session.svg';
import HeaderLogo from '@/assets/svg/logo-header.svg';
import PressableOpacity from './pressable-opacity';
import Cloud from '@/assets/svg/cloud.svg';
import CloudOff from '@/assets/svg/cloud-off.svg';

import { useNetwork } from '@/providers/network-provider';

interface HeaderProps {
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRightPress }) => {
  const { isOnline } = useNetwork();
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.leftContainer}>
        <HeaderLogo />
      </View>

      {/* Right icon */}
      <View style={{ flexDirection: 'row', gap: 24 }}>
        {isOnline ? <Cloud /> : <CloudOff />}

        <PressableOpacity styleAnimated={styles.rightIcon} onPress={onRightPress}>
          <CloseSession />
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
  rightIcon: {
    justifyContent: 'center',
  },
});

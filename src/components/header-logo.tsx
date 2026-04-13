import React from 'react';
import { View, StyleSheet } from 'react-native';
import CloseSession from '@/assets/svg/close-session.svg';
import HeaderLogo from '@/assets/svg/logo-header.svg';
import PressableOpacity from './pressable-opacity';

interface HeaderProps {
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRightPress }) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.leftContainer}>
        <HeaderLogo />
      </View>

      {/* Right icon */}
      <PressableOpacity styleAnimated={styles.rightIcon} onPress={onRightPress}>
        <CloseSession />
      </PressableOpacity>
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

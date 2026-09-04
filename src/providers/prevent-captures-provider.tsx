import React, { useEffect, useRef, useState } from 'react';
import { AppState, Image, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import SplashIcon from '@/assets/images/splash-icon.png';
import { theme } from '@/themes/theme';
import { isIos } from '@/utils/device-utils';

const SPLASH_BG = theme.colors.white;

export const PrivacyOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isIos()) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'inactive' || nextState === 'background') {
        setVisible(true);
      } else if (nextState === 'active' && appState.current !== 'active') {
        setVisible(false);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(250)}
      style={styles.overlay}
    >
      <Image source={SplashIcon} style={styles.image} resizeMode="contain" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  image: {
    width: '50%',
    height: '50%',
  },
});

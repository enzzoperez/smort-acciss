import React, { useRef } from 'react';
import { Pressable, Animated, PressableProps, ViewStyle } from 'react-native';

interface PressableOpacityProps extends PressableProps {
  children: React.ReactNode;
  styleAnimated?: ViewStyle;
}

const PressableOpacity = ({ children, styleAnimated, ...props }: PressableOpacityProps) => {
  const animated = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    Animated.timing(animated, {
      toValue: 0.1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={fadeIn} onPressOut={fadeOut} {...props}>
      <Animated.View style={[{ opacity: animated, flex: 1 }, styleAnimated]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default PressableOpacity;

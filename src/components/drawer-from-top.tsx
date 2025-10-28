import ChevronRight from '@/assets/svg/ChevronRight.svg';
import CloseIcon from '@/assets/svg/CloseIcon.svg';

import { useRouter } from 'expo-router';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

export type DrawerFromTopRef = {
  open: () => void;
  close: () => void;
};

interface DrawerFromTopProps {
  isAccountOptionsOpen?: boolean;
}

const DrawerFromTop = forwardRef<DrawerFromTopRef, DrawerFromTopProps>(
  ({ isAccountOptionsOpen = false }, ref) => {
    const { push } = useRouter();

    const [visible, setVisible] = useState(false);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const translateY = useRef(new Animated.Value(0)).current;

    const open = () => {
      if (contentHeight === null) return;
      setVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const close = () => {
      Animated.timing(translateY, {
        toValue: -(contentHeight ?? 0),
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    };

    useImperativeHandle(ref, () => ({ open, close }));

    const handleLayout = (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      if (contentHeight === null) {
        setContentHeight(height);
        translateY.setValue(-height);
      }
    };

    const handleCloseSession = () => {};

    const publicOptions = [
      {
        label: 'Acerca de G5pro',
        onPress: () => {
          push('/about-g5pro');
        },
      },
      {
        label: 'Sobre el recital de Shakira',
        onPress: () => {
          push('/about-shakira');
        },
      },
    ];

    const loguedOptions = [
      {
        label: 'Datos personales',
        onPress: () => {
          push('/personal-data');
        },
      },
      {
        label: 'Menores de edad',
        onPress: () => {
          push('/age-check-fast-pass');
        },
      },
      { label: 'Cerrar sesión', onPress: handleCloseSession },
    ];

    return (
      <Animated.View
        style={[styles.overlay, { transform: [{ translateY }], opacity: visible ? 1 : 0 }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View onLayout={handleLayout}>
          <View style={styles.header}>
            <TouchableOpacity onPress={close}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {true && isAccountOptionsOpen
            ? loguedOptions.map((option, index) => (
                <TouchableOpacity key={index} style={styles.item} onPress={option.onPress}>
                  <ThemedText
                    style={[
                      styles.itemText,
                      option.label === 'Cerrar sesión' && { color: '#FF5A5F' },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {option.label !== 'Cerrar sesión' && <ChevronRight />}
                </TouchableOpacity>
              ))
            : publicOptions.map((option, index) => (
                <TouchableOpacity key={index} style={styles.item} onPress={option.onPress}>
                  <ThemedText style={styles.itemText}>{option.label}</ThemedText>
                  <ChevronRight />
                </TouchableOpacity>
              ))}
        </View>
      </Animated.View>
    );
  },
);

export default DrawerFromTop;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    paddingTop: 40,
    paddingHorizontal: 16,
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  item: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomColor: '#333',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: {
    color: 'white',
    fontSize: 20,
  },
});

DrawerFromTop.displayName = 'DrawerFromTop';

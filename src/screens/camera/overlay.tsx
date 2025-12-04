import React from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Canvas, DiffRect, rect, rrect } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('screen');
const innerDimension = 310;

const outer = rrect(rect(0, 0, width, height), 4, 0);
const inner = rrect(
  rect(
    width / 2 - innerDimension / 2,
    height / 2.4 - innerDimension / 2,
    innerDimension,
    innerDimension,
  ),
  24,
  24,
);

export const Overlay = () => {
  return (
    <Canvas style={Platform.OS === 'android' ? { flex: 1 } : StyleSheet.absoluteFillObject}>
      <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
    </Canvas>
  );
};

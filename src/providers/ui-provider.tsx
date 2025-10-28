import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface IProps {
  children: React.ReactNode;
}

export const UiProvider = ({ children }: IProps) => {
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >
      {children}
    </GestureHandlerRootView>
  );
};

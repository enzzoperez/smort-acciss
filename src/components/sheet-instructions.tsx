import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

interface ModalSheetProps {
  children: React.ReactElement;
  onDismiss?: () => void;
  isVisible: boolean;
  scrollable?: boolean;
}

export const SheetInstructions = ({
  children,
  onDismiss,
  isVisible,
  scrollable = false,
}: ModalSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleDismissModal = () => {
    onDismiss && onDismiss();
    bottomSheetRef?.current?.close();
  };

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef?.current?.present();
    } else {
      bottomSheetRef?.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetRef}
        detached={true}
        snapPoints={scrollable ? ['80%'] : ['40%']}
        enablePanDownToClose
        onDismiss={handleDismissModal}
        style={styles.sheetContainer}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            enableTouchThrough={false}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={[{ backgroundColor: 'rgba(0, 0, 0, 1)' }, StyleSheet.absoluteFillObject]}
          />
        )}
      >
        <BottomSheetScrollView>{children}</BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: 'pink',
    borderRadius: 10,
  },
});

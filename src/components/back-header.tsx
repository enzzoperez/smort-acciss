import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import BackButton from '@/assets/svg/BackButton.svg';

type BackHeaderProps = {
  title?: string;
  onBackPress?: () => void;
  RightComponent?: React.ReactNode;
};

const BackHeader = ({ title = 'volver', onBackPress, RightComponent }: BackHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: insets.top,
        height: 60 + insets.top,
      }}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <BackButton />
        <ThemedText type="title" style={styles.backText}>
          {title}
        </ThemedText>
      </TouchableOpacity>

      {RightComponent && <View>{RightComponent}</View>}
    </View>
  );
};

export default BackHeader;

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

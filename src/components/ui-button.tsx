import { ActivityIndicator, PressableProps, StyleSheet } from 'react-native';
import PressableOpacity from './pressable-opacity';
import { ThemedText } from './themed-text';
import { theme } from '@/themes/theme';

interface ButtonsProps extends PressableProps {
  onPress: () => void;
  text?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  loading?: boolean;
}

export const UiButton = ({
  onPress,
  text,
  variant = 'primary',
  disabled,
  loading,
  ...props
}: ButtonsProps) => {
  const getVariant = () => {
    if (variant === 'tertiary') return 'tertiary';
    if (variant === 'secondary') return 'secondary';
    return 'primary';
  };

  const getStyle = () => {
    const buttonVariant = getVariant();
    if (buttonVariant === 'tertiary') return styles.buttonTertiary;
    if (buttonVariant === 'secondary') return styles.buttonSecondary;
    return styles.buttonPrimary;
  };

  const getTextStyle = () => {
    const buttonVariant = getVariant();
    if (buttonVariant === 'tertiary') return styles.buttonTertiaryText;
    if (buttonVariant === 'secondary') return styles.buttonSecondaryText;
    return styles.buttonPrimaryText;
  };

  const isDisabled = disabled || loading;

  return (
    <PressableOpacity
      style={[getStyle(), isDisabled && styles.buttonDisabled]}
      onPress={isDisabled ? null : onPress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.gray400} />
      ) : (
        <ThemedText style={[getTextStyle(), isDisabled && styles.textDisabled]}>{text}</ThemedText>
      )}
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonPrimary: {
    height: 56,
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimaryText: {
    color: 'white',
    fontSize: 20,
  },
  buttonSecondary: {
    height: 56,
    borderColor: 'black',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: 'black',
    fontSize: 20,
  },
  buttonTertiary: {
    height: 56,
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonTertiaryText: {
    color: 'white',
    fontSize: 20,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.gray100,
    borderColor: theme.colors.gray200,
    borderWidth: 1,
  },
  textDisabled: {
    color: theme.colors.gray400,
  },
});

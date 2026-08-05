import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ActionLabelProps {
  action: string;
}

export const ActionLabel: React.FC<ActionLabelProps> = ({ action }) => {
  const isAllow = !action.toLowerCase().startsWith('no permitir');

  const colors = {
    icon: isAllow ? '#2F7D32' : '#C62828',
    text: '#111',
    buttonBg: isAllow ? 'rgba(40, 129, 46, 0.1)' : 'rgba(210, 21, 17, 0.1)',
    buttonText: isAllow ? '#28812E' : '#D21511',
  };

  return (
    <View style={styles.container}>
      <View style={[styles.button, { backgroundColor: colors.buttonBg }]}>
        <ThemedText type="subtitle" style={[styles.buttonText, { color: colors.buttonText }]}>
          {action}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 20,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
  },
});

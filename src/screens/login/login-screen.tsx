import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder} />
        </View>

        {/* Inputs */}
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#7A7A7A"
          />

          <TextInput
            placeholder="Contraseña"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#7A7A7A"
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>

        {/* Versión */}
        <Text style={styles.versionText}>v1.0.0</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FB', // Fondo claro fresco
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#E1ECF4', // Lugar para el logo (luego reemplazás)
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderColor: '#D5E3F0',
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF', // Azul iOS vibes
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#8FA3B7',
    fontSize: 14,
  },
});

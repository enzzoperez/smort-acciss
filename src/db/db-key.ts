import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const DB_KEY_STORAGE_KEY = 'db_encryption_key';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Obtiene la clave de cifrado de la DB guardada en el keychain/keystore del device.
// Si no existe (primer arranque), genera una nueva y la persiste.
export function getOrCreateDbEncryptionKey(): string {
  const existingKey = SecureStore.getItem(DB_KEY_STORAGE_KEY);
  if (existingKey) return existingKey;

  const newKey = bytesToHex(Crypto.getRandomBytes(32));
  SecureStore.setItem(DB_KEY_STORAGE_KEY, newKey);

  return newKey;
}

import crypto from 'react-native-quick-crypto';
import { Buffer } from 'buffer';
import { logError } from '@/libs/crashlytics';

/**
 * Descifra un QR dinámico siguiendo la lógica de Java (AES-GCM).
 * @param qrText Formato "DQR:alias:Base64Blob"
 * @param eventSeed Semilla en formato Hexadecimal (32 caracteres = 16 bytes para AES-128)
 */
export const decryptDynamicQR = (
  qrText: string,
  eventSeed: string,
): { alias: string; ticketQr: string; timeslot: string } => {
  if (!qrText.startsWith('DQR:')) {
    throw new Error('QR inválido: no tiene prefijo DQR:');
  }

  // 1️⃣ Extraer el alias y el bloque Base64
  // substring(4) elimina "DQR:"
  const partsMain = qrText.substring(4).split(':');
  if (partsMain.length < 2) {
    throw new Error('Formato inválido: falta alias o bloque Base64');
  }

  try {
    const alias = partsMain[0];
    const base64Blob = partsMain[1];
    const blob = Buffer.from(base64Blob, 'base64');

    // 2️⃣ Convertir semilla HEX → Buffer de bytes
    const key = Buffer.from(eventSeed, 'hex');

    // 3️⃣ Separar componentes (Importante para compatibilidad con Java)
    // En Java, el resultado de GCM es: [IV/Nonce (12b)] + [Ciphertext] + [Tag (16b)]
    // Pero según tu código Java, el blob contiene [Nonce (12)] + [Resto]
    const nonce = blob.subarray(0, 12);

    // En AES-GCM, el tag suele ser de 16 bytes (128 bits) y Java lo pone al final
    const tagLength = 16;
    const encryptedData = blob.subarray(12, blob.length - tagLength);
    const tag = blob.subarray(blob.length - tagLength);

    // 4️⃣ Descifrar con AES-GCM
    // Usamos 'aes-128-gcm' si la llave es de 16 bytes, o 'aes-256-gcm' si es de 32
    const algorithm = key.length === 32 ? 'aes-256-gcm' : 'aes-128-gcm';

    const decipher = crypto.createDecipheriv(algorithm, key, nonce);

    // Establecer el tag de autenticación que extrajimos del final
    decipher.setAuthTag(tag as any);

    // 5️⃣ Procesar el descifrado
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted as any, decipher.final() as any]) as any;

    // 6️⃣ Parsear payload (ticketQr|timeslot)
    const payload = decrypted.toString('utf8');
    const [ticketQr, timeslot] = payload.split('|');

    if (!ticketQr || !timeslot) {
      throw new Error('Payload descifrado con formato inválido');
    }

    return {
      alias,
      ticketQr,
      timeslot,
    };
  } catch (error) {
    console.log('Error al descifrar QR dinámico:', error);
    logError(error as Error);
  }

  // Return a default value or throw an error if the function reaches this point
  throw new Error('Failed to decrypt QR: unexpected error');
};

/**
 * Calcula el timeslot y progreso actual basado en el tiempo ajustado
 */
export const calculateMyTimeSlot = (
  refreshInterval: number,
  offset: number,
): {
  timeSlot: number;
} => {
  const adjustedNowMs = Date.now() + offset;
  // Math.round() centra el slot. El slot NO empieza en 0.
  // Calculamos el inicio real del slot (que está a la mitad del intervalo anterior)
  const timeSlot = Math.round(adjustedNowMs / refreshInterval);

  return {
    timeSlot,
  };
};

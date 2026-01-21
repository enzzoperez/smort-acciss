import { readErrors } from '@/constants/read-errors';
import { logError } from '@/libs/crashlytics';

export function getReadErrorByCode({
  code,
  reason,
  isConnected,
}: {
  code?: string;
  reason?: 'QR_NOT_FOUND' | 'QR_HAS_USED' | 'QR_NOT_VALID';
  isConnected?: boolean;
}): (typeof readErrors)[number] | null {
  try {
    // 🔴 OFFLINE
    if (!isConnected) {
      if (reason) {
        return readErrors.find((err) => err.key === reason) || null;
      }

      return readErrors.find((err) => err.key === 'NETWORK_ERROR') || null;
    }

    // 🟢 ONLINE
    if (code) {
      return readErrors.find((err) => err.code === code) || null;
    }
  } catch (error) {
    logError(error);
  }

  return null;
}

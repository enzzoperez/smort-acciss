import { readErrors } from '@/constants/read-errors';
import { reportError as logError } from '@/utils/error-logger';

export type ReasonErrorResult =
  | 'QR_NOT_FOUND'
  | 'QR_HAS_USED'
  | 'QR_NOT_VALID'
  | 'QR_INACTIVE'
  | 'QR_EVENT_MISMATCH'
  | 'QR_ZONE_MISMATCH'
  | 'QR_EXPIRED'
  | 'NETWORK_ERROR'
  | 'QR_PROVIDER_ERROR'
  | 'QR_DYNAMIC_FORMAT_ERROR'
  | 'QR_TYPE_ERROR'
  | 'QR_ALIAS_ERROR'
  | undefined;

export function getReadErrorByCode({
  code,
  reason,
  isConnected,
}: {
  code?: string;
  reason?: ReasonErrorResult;
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

import { readErrors } from '@/constants/read-errors';
import { reportError as logError } from '@/utils/error-logger';

export function getReadErrorByCode({
  code,
  isConnected,
}: {
  code: string;
  isConnected?: boolean;
}): (typeof readErrors)[number] | null {
  try {
    if (!isConnected) {
      return readErrors.find((err) => err.key === 'NETWORK_ERROR') || null;
    }

    return readErrors.find((err) => err.code === code) || null;
  } catch (error) {
    logError(error);
  }
  return null;
}

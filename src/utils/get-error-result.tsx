import { readErrors } from '@/constants/read-errors';

export function getReadErrorByCode(code: string) {
  return readErrors.find((err) => err.code === code) || null;
}

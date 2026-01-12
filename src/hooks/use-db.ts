import { DbContext } from '@/providers/db-provider';
import { useContext } from 'react';

export function useDb() {
  const ctx = useContext(DbContext);

  if (!ctx) {
    throw new Error('useDb must be used inside DbProvider');
  }

  return ctx;
}

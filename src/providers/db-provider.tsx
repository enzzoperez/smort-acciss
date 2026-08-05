import { createContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { runMigrations } from '@/db/utils';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Db } from '@/db/types';

export type DbContextType = {
  db: Db | null;
  ready: boolean;
};

export const DbContext = createContext<DbContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function DbProvider({ children }: Props) {
  const [db, setDb] = useState<Db | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const sqlite = SQLite.openDatabaseSync('app_v3.db');
      const database = drizzle(sqlite) as Db;

      await runMigrations(sqlite);

      setDb(database);
      setReady(true);
    };

    init();
  }, []);

  return <DbContext.Provider value={{ db, ready }}>{children}</DbContext.Provider>;
}

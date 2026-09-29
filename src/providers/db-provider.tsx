import { createContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { runMigrations } from '@/db/utils';
import { getOrCreateDbEncryptionKey } from '@/db/db-key';
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

// Cacheada a nivel de módulo: si DbProvider se vuelve a montar (Fast Refresh en dev),
// reutiliza la misma conexión en vez de abrir una nueva y dejar la anterior huérfana
// (eso es lo que produce el "NativeDatabase.prepareSync has been rejected").
let cachedDb: Db | null = null;
let initPromise: Promise<Db> | null = null;

function getDb(): Promise<Db> {
  if (cachedDb) return Promise.resolve(cachedDb);

  if (!initPromise) {
    initPromise = (async () => {
      const sqlite = SQLite.openDatabaseSync('app_v4_enc.db');

      // Debe ser la primera operación sobre la conexión, antes de cualquier otra query
      const encryptionKey = getOrCreateDbEncryptionKey();
      await sqlite.execAsync(`PRAGMA key = '${encryptionKey}';`);

      const database = drizzle(sqlite) as Db;

      await runMigrations(sqlite);

      cachedDb = database;
      return database;
    })();
  }

  return initPromise;
}

export function DbProvider({ children }: Props) {
  const [db, setDb] = useState<Db | null>(cachedDb);
  const [ready, setReady] = useState(!!cachedDb);

  useEffect(() => {
    getDb().then((database) => {
      setDb(database);
      setReady(true);
    });
  }, []);

  return <DbContext.Provider value={{ db, ready }}>{children}</DbContext.Provider>;
}

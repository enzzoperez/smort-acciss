import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import type { Db } from './types';

const sqlite = openDatabaseSync('app.db');

export const db = drizzle(sqlite) as Db;

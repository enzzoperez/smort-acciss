import { migrations } from './migrations';
import { Db } from './types';

export async function runMigrations(db: Db) {
  for (const sql of migrations) {
    await db.$client.execAsync(sql);
  }
}

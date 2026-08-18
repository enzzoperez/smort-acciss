import { eq } from 'drizzle-orm';
import { accessSync } from '../schema';
import { Db } from '../types';

export async function getAccessSync(db: Db, code: string) {
  const result = await db.select().from(accessSync).where(eq(accessSync.code, code)).limit(1);

  return result[0] ?? null;
}

export async function createAccessSync(db: Db, code: string) {
  await db.insert(accessSync).values({
    code,
    initialSyncDone: 0,
    lastSyncDate: null,
  });
}

export async function markSyncDone(db: Db, code: string) {
  const lastSyncDate = new Date().toISOString();

  await db
    .update(accessSync)
    .set({
      initialSyncDone: 1,
      lastSyncDate,
    })
    .where(eq(accessSync.code, code));

  return lastSyncDate;
}

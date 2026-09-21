import { eq } from 'drizzle-orm';
import { accessSync } from '../schema';
import { Db } from '../types';

export async function getAccessSync(db: Db, pin: string) {
  const result = await db.select().from(accessSync).where(eq(accessSync.pin, pin)).limit(1);

  return result[0] ?? null;
}

export async function createAccessSync(db: Db, pin: string) {
  await db
    .insert(accessSync)
    .values({
      pin,
      initialSyncDone: 0,
      lastSyncDate: null,
    })
    .onConflictDoNothing();
}

export async function markSyncDone(db: Db, pin: string) {
  const lastSyncDate = new Date().toISOString();

  await db
    .update(accessSync)
    .set({
      initialSyncDone: 1,
      lastSyncDate,
    })
    .where(eq(accessSync.pin, pin));

  return lastSyncDate;
}

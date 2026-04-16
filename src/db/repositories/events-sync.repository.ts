import { and, eq } from 'drizzle-orm';
import { eventsSync } from '../schema';
import { Db } from '../types';

export async function getEventSync(db: Db, eventId: string, accountId: string) {
  const result = await db
    .select()
    .from(eventsSync)
    .where(and(eq(eventsSync.eventId, eventId), eq(eventsSync.accountId, accountId)))
    .limit(1);

  return result[0] ?? null;
}

export async function createEventSync(db: Db, eventId: string, accountId: string) {
  await db.insert(eventsSync).values({
    eventId,
    accountId,
    initialSyncDone: 0,
    lastSyncDate: null,
  });
}

export async function markInitialSyncDone(db: Db, eventId: string, accountId: string) {
  await db
    .update(eventsSync)
    .set({
      initialSyncDone: 1,
      lastSyncDate: new Date().toISOString(),
    })
    .where(and(eq(eventsSync.eventId, eventId), eq(eventsSync.accountId, accountId)));
}

export async function updateLastSyncDate(db: Db, eventId: string, accountId: string) {
  console.log(`Updating last sync date for event ${eventId} and account ${accountId}`);

  await db
    .update(eventsSync)
    .set({
      lastSyncDate: new Date().toISOString(),
    })
    .where(and(eq(eventsSync.eventId, eventId), eq(eventsSync.accountId, accountId)));
}

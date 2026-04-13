import { eq } from 'drizzle-orm';
import { eventsSync } from '../schema';
import { Db } from '../types';

/**
 * Obtener el estado de sync de un evento
 */
export async function getEventSync(db: Db, eventId: string) {
  const result = await db.select().from(eventsSync).where(eq(eventsSync.eventId, eventId)).limit(1);

  return result[0] ?? null;
}

/**
 * Crear registro de sync para un evento
 */
export async function createEventSync(db: Db, eventId: string) {
  await db.insert(eventsSync).values({
    eventId,
    initialSyncDone: 0,
    lastSyncDate: null,
  });
}

/**
 * Marcar que el initial sync ya fue realizado
 */
export async function markInitialSyncDone(db: Db, eventId: string) {
  await db
    .update(eventsSync)
    .set({
      initialSyncDone: 1,
      lastSyncDate: new Date().toISOString(),
    })
    .where(eq(eventsSync.eventId, eventId));
}

/**
 * Actualizar fecha de último sync (para incremental)
 */
export async function updateLastSyncDate(db: Db, eventId: string) {
  await db
    .update(eventsSync)
    .set({
      lastSyncDate: new Date().toISOString(),
    })
    .where(eq(eventsSync.eventId, eventId));
}

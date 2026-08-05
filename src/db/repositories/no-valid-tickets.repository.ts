import { eq } from 'drizzle-orm';
import { noValidTickets } from '../schema';
import type { Db, NewNoValidTicketDb } from '../types';

export async function insertNoValidTicket(db: Db, data: NewNoValidTicketDb) {
  await db.insert(noValidTickets).values(data);
}

export async function getAllNoValidTickets(db: Db) {
  return db.select().from(noValidTickets);
}

export async function getAllPendingNoValidTickets(db: Db) {
  return db.select().from(noValidTickets).where(eq(noValidTickets.syncStatus, 'pending'));
}

export async function clearNoValidTickets(db: Db) {
  await db.delete(noValidTickets);
}

export async function markNoValidTicketsAsSynced(db: any) {
  try {
    await db
      .update(noValidTickets)
      .set({ syncStatus: 'synced' })
      .where(eq(noValidTickets.syncStatus, 'pending'));
  } catch (error) {
    console.error('Error marcando no_valid_tickets como synced', error);
    throw error;
  }
}

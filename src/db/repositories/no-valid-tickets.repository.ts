import { eq } from 'drizzle-orm';
import { db } from '..';
import { noValidTickets } from '../schema';
import type { Db, NewNoValidTicketDb } from '../types';

export async function insertNoValidTicket(db: Db, data: NewNoValidTicketDb) {
  await db.insert(noValidTickets).values(data);
}

export async function getAllNoValidTickets() {
  return db.select().from(noValidTickets);
}

export async function getAllPendingNoValidTickets() {
  return db.select().from(noValidTickets).where(eq(noValidTickets.syncStatus, 'pending'));
}

export async function clearNoValidTickets(db: Db) {
  await db.delete(noValidTickets);
}

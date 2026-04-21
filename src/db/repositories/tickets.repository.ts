import { eq, sql } from 'drizzle-orm';
import { tickets } from '../schema';
import { Db, NewTicketDb, TicketDb } from '../types';

export async function getAllTickets(db: Db): Promise<TicketDb[]> {
  return db.select().from(tickets);
}

export async function insertTickets(db: Db, data: NewTicketDb[]) {
  if (!data.length) return;
  await db.insert(tickets).values(data);
}

export async function clearTickets(db: Db) {
  await db.delete(tickets);
}

export async function countTickets(db: Db, eventId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(eq(tickets.eventId, eventId));
  return result[0]?.count ?? 0;
}

export const getTicketByQr = async (db: Db, qr: string): Promise<TicketDb | null> => {
  const result = await db.select().from(tickets).where(eq(tickets.qr, qr)).limit(1);
  return result.length > 0 ? result[0] : null;
};

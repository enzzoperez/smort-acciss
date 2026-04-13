import { and, eq } from 'drizzle-orm';
import { tickets } from '../schema';
import { Db, NewTicketDb, TicketDb } from '../types';

export async function getAllTickets(db: Db): Promise<TicketDb[]> {
  return db.select().from(tickets);
}

export async function markTicketAsUsed(db: Db, id: string) {
  await db.update(tickets).set({ status: 'used' }).where(eq(tickets.id, id));
}

export async function getUsedTickets(db: Db) {
  return db.select().from(tickets).where(eq(tickets.status, 'used'));
}

export async function insertTickets(db: Db, data: NewTicketDb[]) {
  if (!data.length) return;
  await db.insert(tickets).values(data);
}

export async function clearTickets(db: Db) {
  await db.delete(tickets);
}

export async function getTicketByQr(db: Db, qr: string) {
  const result = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.qr, qr), eq(tickets.status, 'valid')));

  return result[0] ?? null;
}

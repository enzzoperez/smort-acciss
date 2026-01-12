import { eq } from 'drizzle-orm';
import { tickets } from '../schema';
import { Db } from '../types';

export async function insertTickets(
  db: Db,
  list: {
    id: string;
    qr: string;
    eventId: string;
    status: string;
  }[],
) {
  await db.insert(tickets).values(list);
}

export async function getTicketByQr(db: Db, qr: string) {
  const res = await db.select().from(tickets).where(eq(tickets.qr, qr)).limit(1);

  return res[0] ?? null;
}

export async function markTicketAsUsed(db: Db, id: string) {
  await db.update(tickets).set({ status: 'used' }).where(eq(tickets.id, id));
}

export async function getUsedTickets(db: Db) {
  return db.select().from(tickets).where(eq(tickets.status, 'used'));
}

export async function getAllTickets(db: Db) {
  return await db.select().from(tickets);
}

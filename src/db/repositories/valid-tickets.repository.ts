import { eq } from 'drizzle-orm';
import { ticketScan } from '../schema';
import { Db, NewTicketScanDb, TicketScanDb } from '../types';

export async function insertTicketScan(db: Db, data: NewTicketScanDb) {
  await db.insert(ticketScan).values(data);
}

export async function getPendingTicketScans(db: Db): Promise<TicketScanDb[]> {
  return db.select().from(ticketScan).where(eq(ticketScan.syncStatus, 'pending'));
}

export async function getScanTicketByQr(db: Db, qr: string) {
  const result = await db.select().from(ticketScan).where(eq(ticketScan.qr, qr));

  return result[0] ?? null;
}

export const getAllScannedTickets = async (db: Db): Promise<TicketScanDb[]> => {
  return db.select().from(ticketScan);
};

export const getAllPendingScannedTickets = async (db: Db): Promise<TicketScanDb[]> => {
  return db.select().from(ticketScan).where(eq(ticketScan.syncStatus, 'pending'));
};

export async function clearTicketScans(db: Db) {
  await db.delete(ticketScan);
}

export async function markValidTicketAsSynced(db: any) {
  try {
    await db
      .update(ticketScan)
      .set({ syncStatus: 'synced' })
      .where(eq(ticketScan.syncStatus, 'pending'));
  } catch (error) {
    console.error('Error marcando ticket_scan como synced', error);
    throw error;
  }
}

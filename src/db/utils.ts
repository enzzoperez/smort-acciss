import axios from 'axios';
import { migrations } from './migrations';
import { ApiResponse, Db, TicketApi, TicketDb } from './types';
import type { SQLiteDatabase } from 'expo-sqlite';

import { accessSync, noValidTickets, tickets, ticketScan } from './schema';
import {
  getAllPendingScannedTickets,
  markValidTicketAsSynced,
} from './repositories/valid-tickets.repository';
import {
  clearNoValidTickets,
  getAllPendingNoValidTickets,
} from './repositories/no-valid-tickets.repository';
import { Alert } from 'react-native';
import { sql } from 'drizzle-orm';
import {
  getAccessSync,
  createAccessSync,
  markSyncDone,
} from '@/db/repositories/access-sync.repository';

import { formatDateGMTMinus3, isOlderThan30Minutes } from '@/utils/dates-utils';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? '';
const SIZE_PAGE = 1000;

export async function runMigrations(sqlite: SQLiteDatabase) {
  for (const sql of migrations) {
    await sqlite.execAsync(sql);
  }
}

export function mapTicketApiToDb(ticket: TicketApi): TicketDb {
  return {
    eventId: ticket.event,
    qr: ticket.qr,
    section: ticket.section || null,
    redeemType: ticket.redeemType ?? 'SINGLE',
    successfulReads: ticket.successfulReads ?? 0,
    active: ticket.active ? 1 : 0,
  };
}

export function mapTicketsApiToDb(tickets: TicketApi[]): TicketDb[] {
  return tickets?.map(mapTicketApiToDb) ?? [];
}

export async function hasTickets(db: Db): Promise<boolean> {
  try {
    const result = await db.select().from(tickets).limit(1);
    return result.length > 0;
  } catch (error) {
    Alert.alert(
      'Error',
      `Ocurrio un error al verificar los tickets: ${error || 'No se pudieron verificar los tickets'}`,
    );
    return false;
  }
}

export async function getOfflineQrList(db: Db) {
  try {
    const validTickets = await getAllPendingScannedTickets(db);
    const noValidTickets = await getAllPendingNoValidTickets(db);

    const qrListToSend = [
      ...validTickets.map((ticket) => ({
        qrCode: ticket.qr,
        timeScan: ticket.scannedAt,
        mode: ticket.mode ?? 'SCAN',
        direction: ticket.direction ?? 'check_in',
      })),
      ...noValidTickets.map((ticket) => ({
        qrCode: ticket.qr,
        timeScan: ticket.scannedAt,
        mode: ticket.mode ?? 'SCAN',
        direction: ticket.direction ?? 'check_in',
        errorCode: ticket.reason ?? undefined,
      })),
    ];

    return qrListToSend;
  } catch (error) {
    console.error('Error leyendo QRs offline', error);
    return [];
  }
}

async function fetchIssuedTicketsByCode({
  pin,
  db,
  fromDate,
}: {
  pin: string;
  db: Db;
  fromDate?: string | null;
}) {
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const { data } = await axios.post<ApiResponse>(
      `${BASE_URL}/access-control/scan-access/issued`,
      { pin },
      {
        params: {
          page,
          size: SIZE_PAGE,
          includeInactive: true,
          fromDate: fromDate ? formatDateGMTMinus3(fromDate) : undefined,
        },
        headers: {
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
        },
      },
    );

    totalPages = data?.pageable?.totalPages ?? 1;

    const mapped = mapTicketsApiToDb(data.content);

    if (mapped.length > 0) {
      await db
        .insert(tickets)
        .values(mapped)
        .onConflictDoUpdate({
          target: tickets.qr,
          set: {
            eventId: sql`excluded.event_id`,
            section: sql`excluded.section`,
            redeemType: sql`excluded.redeem_type`,
            successfulReads: sql`excluded.successful_reads`,
            active: sql`excluded.active`,
          },
        });
    }

    page++;
  }
}

export async function syncIssuedTicketsForAccess({
  pin,
  db,
  isOnline,
}: {
  pin: string;
  db: Db;
  isOnline: boolean;
}): Promise<string | null> {
  if (!isOnline) return null;

  const sync = await getAccessSync(db, pin);

  if (!sync) {
    await createAccessSync(db, pin);
    await fetchIssuedTicketsByCode({ pin, db });
  } else {
    const isStale = !sync.lastSyncDate || isOlderThan30Minutes(new Date(sync.lastSyncDate));
    await fetchIssuedTicketsByCode({
      pin,
      db,
      fromDate: isStale ? undefined : sync.lastSyncDate,
    });
  }

  return markSyncDone(db, pin);
}

export async function clearOfflineQueue(db: Db) {
  try {
    await markValidTicketAsSynced(db);
    await clearNoValidTickets(db);
  } catch (error) {
    console.error('Error limpiando cola offline', error);
  }
}

export const clearAllData = async (db: Db) => {
  try {
    await db.delete(tickets);
    await db.delete(ticketScan);
    await db.delete(noValidTickets);
    await db.delete(accessSync);
  } catch (error) {
    console.error('Error limpiando toda la data', error);
  }
};

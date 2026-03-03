import axios from 'axios';
import { migrations } from './migrations';
import { ApiResponse, Db, TicketApi, TicketDb } from './types';
import type { SQLiteDatabase } from 'expo-sqlite';

import { noValidTickets, tickets, ticketScan } from './schema';
import { store } from '@/store/store';
import { clearTickets } from './repositories/tickets.repository';
import {
  getAllPendingScannedTickets,
  markValidTicketAsSynced,
} from './repositories/valid-tickets.repository';
import {
  clearNoValidTickets,
  getAllPendingNoValidTickets,
} from './repositories/no-valid-tickets.repository';
import { Alert } from 'react-native';
import { setSelectedEvent } from '@/store/slices';

export async function runMigrations(sqlite: SQLiteDatabase) {
  for (const sql of migrations) {
    await sqlite.execAsync(sql);
  }
}

export function mapTicketApiToDb(ticket: TicketApi): TicketDb {
  return {
    id: ticket.qr,
    eventId: ticket.event,
    qr: ticket.qr,
    status: ticket.status,
    section: ticket.section || null,
  };
}

export function mapTicketsApiToDb(tickets: TicketApi[]): TicketDb[] {
  return tickets.length < 1 ? [] : tickets.map(mapTicketApiToDb);
}

export async function hasTickets(db: Db): Promise<boolean> {
  try {
    console.log('PASA por HASTICKETS FUNCTION', { db });

    const result = await db.select().from(tickets).limit(1);
    console.log('RESULT HAS TICKETS', { result });

    return result.length > 0;
  } catch (error) {
    // Alert.alert(
    //   'Error',
    //   `Ocurrio un error al verificar los tickets: ${error || 'No se pudieron verificar los tickets'}`,
    // );
    console.log('Error hasTickets', { error });
    return false;
  }
}

export async function initialSyncTickets(eventId: string, db: Db) {
  const accessToken = store?.getState()?.auth?.accessToken;
  let page = 0;
  let totalPages = 1;

  try {
    if (db && (await hasTickets(db))) {
      console.log('PASA POR IF hs TICKETS');

      await clearTickets(db);
    }

    while (page < totalPages) {
      const { data } = await axios.get<ApiResponse>(
        `${process.env.EXPO_PUBLIC_BASE_URL}/access-control/${eventId}/issued`,
        {
          params: {
            pageNumber: page,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      totalPages = data?.pageable?.totalPages;

      const mapped = mapTicketsApiToDb(data.content);

      if (mapped.length > 1) {
        await db.insert(tickets).values(mapped).onConflictDoNothing();
      }

      page++;
    }
  } catch (error) {
    setSelectedEvent(null);
    console.log('Initial sync failed in utils', {
      error,
    });
    Alert.alert(
      'Error in select event',
      `Ocurrio un error: ${error || 'No se pudieron obtener los tickets'}`,
    );

    throw error;
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
      })),
      ...noValidTickets.map((ticket) => ({
        qrCode: ticket.qr,
        timeScan: ticket.scannedAt,
      })),
    ];

    return qrListToSend;
  } catch (error) {
    console.error('Error leyendo QRs offline', error);
    return [];
  }
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
  } catch (error) {
    console.error('Error limpiando toda la data', error);
  }
};

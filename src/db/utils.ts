import axios from 'axios';
import { migrations } from './migrations';
import { ApiResponse, Db, TicketApi, TicketDb } from './types';
import { db } from '.';
import { tickets } from './schema';
import { store } from '@/store/store';
import { clearTickets } from './repositories/tickets.repository';
import {
  clearTicketScans,
  getAllPendingScannedTickets,
} from './repositories/valid-tickets.repository';
import {
  clearNoValidTickets,
  getAllPendingNoValidTickets,
} from './repositories/no-valid-tickets.repository';

export async function runMigrations(db: Db) {
  for (const sql of migrations) {
    await db.$client.execAsync(sql);
  }
}

export function mapTicketApiToDb(ticket: TicketApi): TicketDb {
  return {
    id: ticket.qr,
    qr: ticket.qr,
    status: ticket.status,
  };
}

export function mapTicketsApiToDb(tickets: TicketApi[]): TicketDb[] {
  return tickets.map(mapTicketApiToDb);
}

export async function hasTickets(): Promise<boolean> {
  const result = await db.select().from(tickets).limit(1);
  return result.length > 0;
}

export async function initialSyncTickets(eventId: string) {
  const accessToken = store?.getState()?.auth?.accessToken;
  let page = 0;
  let totalPages = 1;

  try {
    if (await hasTickets()) {
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

      if (mapped.length) {
        await db.insert(tickets).values(mapped).onConflictDoNothing();
      }

      page++;
    }
  } catch (error) {
    console.log(' Initial sync failed', {
      page,
      error,
    });

    throw error;
  }
}

export async function getOfflineQrList() {
  try {
    const validTickets = await getAllPendingScannedTickets();
    const noValidTickets = await getAllPendingNoValidTickets();

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

export async function clearOfflineQueue() {
  try {
    await clearTicketScans(db);
    await clearNoValidTickets(db);
  } catch (error) {
    console.error('Error limpiando cola offline', error);
  }
}

import axios from 'axios';
import { migrations } from './migrations';
import { ApiResponse, Db, Ticket, TicketApi } from './types';
import { db } from '.';
import { tickets } from './schema';
import { store } from '@/store/store';
import { clearTickets } from './repositories/ticketsRepository';

export async function runMigrations(db: Db) {
  for (const sql of migrations) {
    await db.$client.execAsync(sql);
  }
}

export function mapTicketApiToDb(ticket: TicketApi): Ticket {
  return {
    id: ticket.qr,
    qr: ticket.qr,
    eventId: ticket.event,
    status: ticket.status,
  };
}

export function mapTicketsApiToDb(tickets: TicketApi[]): Ticket[] {
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

      totalPages = data.pageable.totalPages;

      const mapped = mapTicketsApiToDb(data.content);

      if (mapped.length) {
        await db.insert(tickets).values(mapped).onConflictDoNothing();
      }

      page++;
    }
  } catch (error) {
    console.log(' Initial sync failed', {
      eventId,
      page,
      error,
    });

    throw error;
  }
}

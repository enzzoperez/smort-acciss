import axios from 'axios';
import { migrations } from './migrations';
import { ApiResponse, Db, TicketApi, TicketDb } from './types';
import type { SQLiteDatabase } from 'expo-sqlite';

import { noValidTickets, tickets, ticketScan } from './schema';
import { store } from '@/store/store';
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
  getEventSync,
  createEventSync,
  markInitialSyncDone,
  updateLastSyncDate,
} from '@/db/repositories/events-sync.repository';

import { formatDateGMTMinus3, isOlderThan30Minutes } from '@/utils/dates-utils';

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

export async function initialSyncTickets(eventId: string, db: Db) {
  const accessToken = store?.getState()?.auth?.accessToken;

  if (!accessToken) {
    Alert.alert(
      'Error',
      'No se pudo obtener el token de acceso. Por favor, inicia sesión nuevamente.',
    );
    return;
  }

  let page = 0;
  let totalPages = 1;

  try {
    while (page < totalPages) {
      const { data } = await axios.get<ApiResponse>(
        `${process.env.EXPO_PUBLIC_BASE_URL}/access-control/${eventId}/issued?includeInactive=true`,
        {
          params: {
            page: page,
            size: 500,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
  } catch (error) {
    throw error;
  }
}

export async function incrementalSyncTickets({
  eventId,
  db,
  fromDate,
}: {
  eventId: string;
  db: Db;
  fromDate?: string | null;
}) {
  const accessToken = store?.getState()?.auth?.accessToken;
  if (!accessToken) {
    Alert.alert(
      'Error',
      'No se pudo obtener el token de acceso. Por favor, inicia sesión nuevamente.',
    );
    return;
  }

  let page = 0;
  let totalPages = 1;

  try {
    while (page < totalPages) {
      const { data } = await axios.get<ApiResponse>(
        `${process.env.EXPO_PUBLIC_BASE_URL}/access-control/${eventId}/issued?includeInactive=true`,
        {
          params: {
            size: 500,
            page: page,
            fromDate: fromDate ? formatDateGMTMinus3(fromDate) : undefined,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
  } catch (error) {
    console.error('Incremental sync failed', error);
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
        errorCode: ticket.reason ?? undefined,
      })),
    ];

    return qrListToSend;
  } catch (error) {
    console.error('Error leyendo QRs offline', error);
    return [];
  }
}

export async function syncTicketsForEvent({
  eventId,
  db,
  isOnline,
  accountId,
}: {
  eventId: string;
  db: Db;
  isOnline: boolean;
  accountId: string;
}) {
  const syncingEvents = new Set<string>();

  if (syncingEvents.has(eventId)) {
    return;
  }

  syncingEvents.add(eventId);

  try {
    const eventSync = await getEventSync(db, eventId, accountId);

    // EVENTO NUNCA DESCARGADO
    if (!eventSync) {
      if (!isOnline) {
        Alert.alert(
          'Sin conexión',
          'Este evento nunca fue descargado. Conectate a internet para poder usarlo.',
        );
        return;
      }

      await createEventSync(db, eventId, accountId);
      await initialSyncTickets(eventId, db);
      await markInitialSyncDone(db, eventId, accountId);

      return;
    }

    // EVENTO YA DESCARGADO
    if (isOnline) {
      const lastSync = eventSync.lastSyncDate ? new Date(eventSync.lastSyncDate) : null;
      const isStale = !lastSync || isOlderThan30Minutes(lastSync);

      await incrementalSyncTickets({
        eventId,
        db,
        fromDate: isStale ? undefined : eventSync.lastSyncDate,
      });
      await markInitialSyncDone(db, eventId, accountId);
    } else {
      Alert.alert(
        'Sin conexión',
        'Estás usando los tickets descargados anteriormente. Los cambios recientes podrían no estar disponibles.',
      );
    }
  } finally {
    syncingEvents.delete(eventId);
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

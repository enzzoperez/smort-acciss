import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { noValidTickets, tickets, ticketScan } from './schema';
import type * as schema from './schema';

export type TicketDb = typeof tickets.$inferSelect;
export type NewTicketDb = typeof tickets.$inferInsert;

export type TicketScanDb = typeof ticketScan.$inferSelect;
export type NewTicketScanDb = typeof ticketScan.$inferInsert;

export type NoValidTicketDb = typeof noValidTickets.$inferSelect;
export type NewNoValidTicketDb = typeof noValidTickets.$inferInsert;

export type Db = ExpoSQLiteDatabase<typeof schema>;

export type TicketApi = {
  event: string;
  status: string;
  qr: string;
  redeemType: string;
  nomination?: {
    docType: string;
    document: string;
    names: string;
  };
  createdAt: string;
  updatedAt: string;
  section?: string;
  seat?: string;
  cart?: string;
};

export type ApiResponse = {
  content: TicketApi[];
  pageable: {
    pageNumber: number;
    totalPages: number;
  };
};

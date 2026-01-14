import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { tickets } from './schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export type Ticket = InferSelectModel<typeof tickets>;
export type NewTicket = InferInsertModel<typeof tickets>;

export type Db = ReturnType<typeof drizzle>;

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

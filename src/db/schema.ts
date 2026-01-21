import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  qr: text('qr').notNull(),
  status: text('status').notNull(), // valid | used | blocked
});

export const ticketScan = sqliteTable('ticket_scan', {
  id: text('id').primaryKey(),
  qr: text('qr').notNull(),
  scannedAt: text('scanned_at').notNull(),
  syncStatus: text('sync_status').notNull(), // pending | synced | error
});

export const noValidTickets = sqliteTable('no_valid_tickets', {
  id: text('id').primaryKey(),
  qr: text('qr').notNull(),
  reason: text('reason').notNull(), // USED | NOT_FOUND
  scannedAt: text('scanned_at').notNull(),
  syncStatus: text('sync_status').notNull(), // pending | synced | error
});

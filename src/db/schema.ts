import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull(),
  qr: text('qr').notNull(),
  status: text('status').notNull(), // valid | used | blocked
  section: text('section'),
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
  reason: text('reason').notNull(), // QR_HAS_USED | NOT_FOUND | EVENT_MISMATCH | ZONE_MISMATCH | EXPIRED | INVALID_DYNAMIC
  scannedAt: text('scanned_at').notNull(),
  syncStatus: text('sync_status').notNull(), // pending | synced | error
});

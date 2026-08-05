import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';

export const tickets = sqliteTable(
  'tickets',
  {
    qr: text('qr').primaryKey(),
    eventId: text('event_id').notNull(),
    section: text('section'),
    redeemType: text('redeem_type').notNull(),
    successfulReads: integer('successful_reads').notNull().default(0),
    active: integer('active').notNull().default(1),
  },
  (table) => [index('idx_tickets_qr').on(table.qr), index('idx_tickets_event').on(table.eventId)],
);

export const ticketScan = sqliteTable('ticket_scan', {
  id: text('id').primaryKey(),
  qr: text('qr').notNull(),
  eventId: text('event_id').notNull(),
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

export const eventsSync = sqliteTable(
  'events_sync',
  {
    eventId: text('event_id').notNull(),
    accountId: text('account_id').notNull(),
    lastSyncDate: text('last_sync_date'),
    initialSyncDone: integer('initial_sync_done').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.accountId] })],
);

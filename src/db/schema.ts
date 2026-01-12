import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  qr: text('qr').notNull(),
  eventId: text('event_id').notNull(),
  status: text('status').notNull(), // valid | used | blocked
});

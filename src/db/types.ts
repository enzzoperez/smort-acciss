import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { tickets } from './schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export type Ticket = InferSelectModel<typeof tickets>;
export type NewTicket = InferInsertModel<typeof tickets>;

export type Db = ReturnType<typeof drizzle>;

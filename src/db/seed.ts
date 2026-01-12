import { db } from './index';
import { tickets } from './schema';

export const seedTickets = async () => {
  const existing = await db.select().from(tickets).limit(1);

  if (existing.length > 0) return;

  await db.insert(tickets).values([
    {
      id: '1',
      qr: 'QR_ABC_123',
      eventId: 'EVENT_1',
      status: 'valid',
    },
    {
      id: '2',
      qr: 'QR_DEF_456',
      eventId: 'EVENT_1',
      status: 'used',
    },
    {
      id: '3',
      qr: 'QR_GHI_789',
      eventId: 'EVENT_2',
      status: 'valid',
    },
  ]);
};

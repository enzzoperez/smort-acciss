export const up = `
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  qr TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status TEXT NOT NULL
);
`;

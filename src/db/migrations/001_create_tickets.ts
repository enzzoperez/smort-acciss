export const up = `
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  qr TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_scan (
  id TEXT PRIMARY KEY,
  qr TEXT NOT NULL,
  scanned_at TEXT NOT NULL,
  sync_status TEXT NOT NULL -- pending | synced | error
);

CREATE TABLE IF NOT EXISTS no_valid_tickets (
  id TEXT PRIMARY KEY,
  qr TEXT NOT NULL,
  reason TEXT NOT NULL, -- QR_HAS_USED | QR_NOT_FOUND
  scanned_at TEXT NOT NULL
  sync_status TEXT NOT NULL -- pending | synced | error
);
`;

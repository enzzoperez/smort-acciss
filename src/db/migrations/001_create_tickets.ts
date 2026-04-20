export const up = `
-- ======================================
-- TICKETS
-- ======================================
CREATE TABLE IF NOT EXISTS tickets (
  qr TEXT PRIMARY KEY NOT NULL,
  event_id TEXT NOT NULL,
  section TEXT,
  redeem_type TEXT NOT NULL,
  successful_reads INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

-- ======================================
-- TICKET SCAN (válidos escaneados)
-- ======================================
CREATE TABLE IF NOT EXISTS ticket_scan (
  id TEXT PRIMARY KEY,
  qr TEXT NOT NULL,
  scanned_at TEXT NOT NULL,
  sync_status TEXT NOT NULL -- pending | synced | error
);

-- ======================================
-- NO VALID TICKETS (rechazados)
-- ======================================
CREATE TABLE IF NOT EXISTS no_valid_tickets (
  id TEXT PRIMARY KEY,
  qr TEXT NOT NULL,
  reason TEXT NOT NULL, 
  -- QR_HAS_USED | QR_NOT_FOUND | QR_EVENT_MISMATCH | 
  -- QR_SECTION_NOT_ALLOWED | QR_TIMESLOT_INVALID | 
  scanned_at TEXT NOT NULL,
  sync_status TEXT NOT NULL -- pending | synced | error
);

-- ======================================
-- EVENTS SYNC
-- ======================================
CREATE TABLE IF NOT EXISTS events_sync (
  event_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  last_sync_date TEXT,
  initial_sync_done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (event_id, account_id)
);

-- ======================================
-- INDEXES (muy importantes para performance)
-- ======================================

CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

CREATE INDEX IF NOT EXISTS idx_ticket_scan_qr ON ticket_scan(qr);

CREATE INDEX IF NOT EXISTS idx_no_valid_tickets_qr ON no_valid_tickets(qr);
`;

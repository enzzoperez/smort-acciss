export const up = `
-- ======================================
-- TICKETS
-- ======================================
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  qr TEXT NOT NULL,
  status TEXT NOT NULL, -- valid | used | blocked
  section TEXT
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
  -- QR_SECTION_NOT_ALLOWED | QR_TIMESLOT_INVALID | QR_INVALID_DYNAMIC
  scanned_at TEXT NOT NULL,
  sync_status TEXT NOT NULL -- pending | synced | error
);

-- ======================================
-- INDEXES (muy importantes para performance)
-- ======================================

CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

CREATE INDEX IF NOT EXISTS idx_ticket_scan_qr ON ticket_scan(qr);

CREATE INDEX IF NOT EXISTS idx_no_valid_tickets_qr ON no_valid_tickets(qr);
`;

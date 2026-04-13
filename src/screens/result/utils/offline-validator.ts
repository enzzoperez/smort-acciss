import { eq } from 'drizzle-orm';
import { tickets, noValidTickets, ticketScan } from '@/db/schema';
import { decryptDynamicQR, calculateMyTimeSlot } from '../../../utils/qr-utils';
import { logError } from '@/libs/crashlytics';
import { ResConfigEventQr } from '@/api/events-api';
import * as crypto from 'expo-crypto';
import { formatDateWithOffset } from '@/utils/dates-utils';
import { ReasonErrorResult } from '@/utils/get-error-result';

type OfflineValidationResult =
  | { type: 'success' }
  | {
      type: 'error';
      reason: ReasonErrorResult;
    };

export async function validateQrOfflineFlow({
  db,
  qr,
  currentEventId,
  configEventQr,
  serverOffset,
  allowedSections,
  verifyOnly,
}: {
  db: any;
  qr: string;
  currentEventId: string;
  serverOffset: number;
  configEventQr: ResConfigEventQr | null;
  allowedSections: string[] | null;
  verifyOnly?: boolean;
}): Promise<OfflineValidationResult> {
  const now = formatDateWithOffset(new Date());
  let finalQr = qr;

  // ======================================
  // 🔐 QR DINÁMICO
  // ======================================
  if (configEventQr?.qrMode === 'DYNAMIC') {
    try {
      const { ticketQr, timeslot } = decryptDynamicQR(qr, configEventQr.eventSeed);

      // Validar timeslot con tolerancia 1 minuto
      const { timeSlot: currentSlot } = calculateMyTimeSlot(
        configEventQr.refreshInterval,
        serverOffset,
      );

      const qrSlot = Number(timeslot);

      // tolerancia dinámica de 1 minuto
      const toleranceSlots = Math.ceil(60000 / configEventQr.refreshInterval);

      const isWithinTolerance = Math.abs(qrSlot - currentSlot) <= toleranceSlots;

      if (!isWithinTolerance) {
        await db.insert(noValidTickets).values({
          id: crypto.randomUUID(),
          qr,
          scannedAt: now,
          reason: 'QR_TIMESLOT_INVALID',
          syncStatus: 'pending',
        });

        return { type: 'error', reason: 'QR_EXPIRED' };
      }

      finalQr = ticketQr;
    } catch (error) {
      logError(error);
      await db.insert(noValidTickets).values({
        id: crypto.randomUUID(),
        qr,
        scannedAt: now,
        reason: 'QR_INVALID_DYNAMIC',
        syncStatus: 'pending',
      });

      return { type: 'error', reason: 'QR_INVALID_DYNAMIC' };
    }
  }

  // ======================================
  // 1️⃣ ¿YA ESCANEADO?
  // ======================================
  const alreadyScanned = await db
    .select()
    .from(ticketScan)
    .where(eq(ticketScan.qr, finalQr))
    .limit(1);

  if (alreadyScanned.length > 0) {
    if (!verifyOnly) {
      await db.insert(noValidTickets).values({
        id: crypto.randomUUID(),
        qr: finalQr,
        scannedAt: now,
        reason: 'QR_HAS_USED',
        syncStatus: 'pending',
      });
    }

    return { type: 'error', reason: 'QR_HAS_USED' };
  }

  // ======================================
  // 2️⃣ ¿EXISTE EN TICKETS?
  // ======================================
  const ticketResult = await db.select().from(tickets).where(eq(tickets.qr, finalQr)).limit(1);

  if (ticketResult.length === 0) {
    if (!verifyOnly) {
      await db.insert(noValidTickets).values({
        id: crypto.randomUUID(),
        qr: finalQr,
        scannedAt: now,
        reason: 'QR_NOT_FOUND',
        syncStatus: 'pending',
      });
    }

    return { type: 'error', reason: 'QR_NOT_FOUND' };
  }

  const ticket = ticketResult[0];

  // ======================================
  // 3️⃣ EVENT MATCH (doble seguridad)
  // ======================================
  if (ticket.eventId !== currentEventId) {
    if (!verifyOnly) {
      await db.insert(noValidTickets).values({
        id: crypto.randomUUID(),
        qr: finalQr,
        scannedAt: now,
        reason: 'QR_EVENT_MISMATCH',
        syncStatus: 'pending',
      });
    }

    return { type: 'error', reason: 'QR_EVENT_MISMATCH' };
  }

  // ======================================
  // 4️⃣ VALIDACIÓN POR SECTOR
  // ======================================
  if (allowedSections && allowedSections.length > 0 && !allowedSections.includes(ticket.section)) {
    if (!verifyOnly) {
      await db.insert(noValidTickets).values({
        id: crypto.randomUUID(),
        qr: finalQr,
        scannedAt: now,
        reason: 'QR_ZONE_MISMATCH',
        syncStatus: 'pending',
      });
    }

    return { type: 'error', reason: 'QR_ZONE_MISMATCH' };
  }

  // ======================================
  // ✅ VALIDACIÓN OK
  // ======================================
  if (!verifyOnly) {
    await db.insert(ticketScan).values({
      id: crypto.randomUUID(),
      qr: finalQr,
      scannedAt: now,
      syncStatus: 'pending',
    });
  }

  return { type: 'success' };
}

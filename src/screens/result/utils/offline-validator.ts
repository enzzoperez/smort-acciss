import { inArray, sql } from 'drizzle-orm';
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
  validEventIds,
  configEventQr,
  serverOffset,
  allowedSections,
  verifyOnly,
}: {
  db: any;
  qr: string;
  validEventIds: string[];
  serverOffset: number;
  configEventQr: ResConfigEventQr[] | null;
  allowedSections: string[] | null;
  verifyOnly?: boolean;
}): Promise<OfflineValidationResult> {
  const now = formatDateWithOffset(new Date());
  let finalQr = qr;

  // ======================================
  // 🔐 QR DINÁMICO
  // ======================================
  if (qr.startsWith('DQR:')) {
    const qrAlias = qr.substring(4).split(':')[0];

    // Find the config whose alias matches the QR alias
    const matchingConfig = configEventQr?.find((c) => c.alias === qrAlias);

    if (!matchingConfig) {
      if (!verifyOnly) {
        await db.insert(noValidTickets).values({
          id: crypto.randomUUID(),
          qr,
          scannedAt: now,
          reason: 'QR_EVENT_MISMATCH',
          syncStatus: 'pending',
        });
      }

      return { type: 'error', reason: 'QR_EVENT_MISMATCH' };
    }

    try {
      const { ticketQr, timeslot } = decryptDynamicQR(qr, matchingConfig.eventSeed);

      const { timeSlot: currentSlot } = calculateMyTimeSlot(
        matchingConfig.refreshInterval,
        serverOffset,
      );

      const qrSlot = Number(timeslot);
      const toleranceSlots = Math.ceil(60000 / matchingConfig.refreshInterval);
      const isWithinTolerance = Math.abs(qrSlot - currentSlot) <= toleranceSlots;

      if (!isWithinTolerance) {
        await db.insert(noValidTickets).values({
          id: crypto.randomUUID(),
          qr: ticketQr,
          scannedAt: now,
          reason: 'QR_EXPIRED',
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
        reason: 'QR_DYNAMIC_FORMAT_ERROR',
        syncStatus: 'pending',
      });

      return { type: 'error', reason: 'QR_DYNAMIC_FORMAT_ERROR' };
    }
  }

  // ======================================
  // 1️⃣ ¿EXISTE EN TICKETS?
  // ======================================

  const ticketResult = await db
    .select()
    .from(tickets)
    .where(inArray(tickets.qr, [finalQr]))
    .limit(1);

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

    return { type: 'error', reason: 'QR_NOT_FOUND_OFFLINE' };
  }

  const ticket = ticketResult[0];

  // ======================================
  // 2️⃣ TICKET ACTIVO
  // ======================================
  if (!ticket.active) {
    if (!verifyOnly) {
      await db.insert(noValidTickets).values({
        id: crypto.randomUUID(),
        qr: finalQr,
        scannedAt: now,
        reason: 'QR_INACTIVE',
        syncStatus: 'pending',
      });
    }

    return { type: 'error', reason: 'QR_INACTIVE' };
  }

  // ======================================
  // 4️⃣ EVENT MATCH
  // ======================================
  if (!validEventIds.includes(ticket.eventId)) {
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
  // 5️⃣ VALIDACIÓN POR SECTOR
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
  // 6️⃣ VALIDACIÓN DE USO (SINGLE / MULTI)
  // ======================================

  if (ticket.redeemType === 'SINGLE') {
    const offlineReadsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ticketScan)
      .where(inArray(ticketScan.qr, [finalQr]));

    const offlineReads = offlineReadsCount[0]?.count ?? 0;
    const totalReads = ticket.successfulReads + offlineReads;

    if (totalReads >= 1) {
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
  }

  // ======================================
  // ✅ VALIDACIÓN OK
  // ======================================

  if (!verifyOnly) {
    await db.insert(ticketScan).values({
      id: crypto.randomUUID(),
      qr: finalQr,
      eventId: ticket.eventId,
      scannedAt: now,
      syncStatus: 'pending',
    });
  }

  return { type: 'success' };
}

// lib/slots.ts
// Time slot generation logic
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Branch: feature/calendar
// ═══════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/types";

const SLOT_STEP_MINUTES = 30;

function toMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Generate available time slots for a given date and event duration
 * @param userId - The host's user ID
 * @param date - The date to check (YYYY-MM-DD string)
 * @param durationMinutes - Duration of the meeting in minutes
 * @returns Array of available TimeSlots
 */
export async function generateSlots(
  userId: string,
  date: string,
  durationMinutes: number
): Promise<TimeSlot[]> {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);
  const dayOfWeek = dayStart.getUTCDay();

  // Host availability windows for this weekday
  const windows = await prisma.availability.findMany({
    where: { userId, dayOfWeek, isActive: true },
  });

  // Existing bookings that could block slots on this day
  const existing = await prisma.booking.findMany({
    where: {
      eventType: { userId },
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { lte: dayEnd },
      endTime: { gte: dayStart },
    },
    select: { startTime: true, endTime: true },
  });

  const now = new Date();
  const slots: TimeSlot[] = [];

  for (const window of windows) {
    const startMin = toMinutes(window.startTime);
    const endMin = toMinutes(window.endTime);
    if (startMin === null || endMin === null || endMin <= startMin) continue;

    for (
      let offset = startMin;
      offset + durationMinutes <= endMin;
      offset += SLOT_STEP_MINUTES
    ) {
      const slotStart = new Date(dayStart.getTime() + offset * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

      // Don't offer slots in the past
      if (slotStart <= now) continue;

      // Overlap check against existing bookings
      const overlaps = existing.some(
        (b) => slotStart < b.endTime && slotEnd > b.startTime
      );

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !overlaps,
      });
    }
  }

  // Sort by start time (windows may be out of order)
  slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return slots;
}

/**
 * Check if a time slot conflicts with existing bookings
 * @param userId - The host's user ID
 * @param startTime - Proposed start time (UTC)
 * @param endTime - Proposed end time (UTC)
 * @returns true if there IS a conflict, false if slot is free
 */
export async function checkTimeConflict(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      eventType: { userId },
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        { startTime: { gte: startTime, lt: endTime } },
        { endTime: { gt: startTime, lte: endTime } },
        { startTime: { lte: startTime }, endTime: { gte: endTime } },
      ],
    },
  });

  return !!conflict;
}

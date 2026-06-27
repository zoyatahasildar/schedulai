// lib/slots.ts
// Time slot generation logic
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Branch: feat/calendar-slots
// ═══════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/types";

/**
 * Generate available time slots for a given date and event duration.
 * All times are treated and returned in UTC.
 *
 * @param userId          - The host's user ID
 * @param date            - The date to check (YYYY-MM-DD, treated as UTC)
 * @param durationMinutes - Duration of the meeting in minutes
 * @returns Array of TimeSlot objects (available + unavailable)
 */
export async function generateSlots(
  userId: string,
  date: string,
  durationMinutes: number
): Promise<TimeSlot[]> {
  // 1. Determine day-of-week (UTC) for the requested date
  const targetDate = new Date(`${date}T00:00:00Z`);
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday … 6 = Saturday

  // 2. Fetch the host's availability rule for that day
  const availability = await prisma.availability.findFirst({
    where: { userId, dayOfWeek, isActive: true },
  });

  if (!availability) {
    // Host has no availability configured for this day — return empty
    return [];
  }

  // 3. Fetch all PENDING / CONFIRMED bookings for that calendar date (UTC)
  const dayStart = new Date(`${date}T00:00:00Z`);
  const dayEnd   = new Date(`${date}T23:59:59Z`);

  const existingBookings = await prisma.booking.findMany({
    where: {
      eventType: { userId },
      status:    { in: ["PENDING", "CONFIRMED"] },
      startTime: { gte: dayStart, lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });

  // 4. Build the availability window as UTC Date objects
  //    availability.startTime / endTime are stored as "HH:MM" UTC strings
  const [wStartH, wStartM] = availability.startTime.split(":").map(Number);
  const [wEndH,   wEndM  ] = availability.endTime.split(":").map(Number);

  const windowStart = new Date(`${date}T00:00:00Z`);
  windowStart.setUTCHours(wStartH, wStartM, 0, 0);

  const windowEnd = new Date(`${date}T00:00:00Z`);
  windowEnd.setUTCHours(wEndH, wEndM, 0, 0);

  // 5. Step through the window in 30-min increments and emit slots
  //    A slot is valid when its full duration fits within the window.
  const STEP_MS     = 30 * 60 * 1000;          // 30 minutes
  const DURATION_MS = durationMinutes * 60000;

  const slots: TimeSlot[] = [];
  let cursor = new Date(windowStart);

  while (cursor.getTime() + DURATION_MS <= windowEnd.getTime()) {
    const slotStart = new Date(cursor);
    const slotEnd   = new Date(cursor.getTime() + DURATION_MS);

    // 6. Check if this slot overlaps any existing booking
    const hasConflict = existingBookings.some((booking) => {
      const bStart = new Date(booking.startTime);
      const bEnd   = new Date(booking.endTime);
      // Overlap: slot starts before booking ends AND slot ends after booking starts
      return slotStart < bEnd && slotEnd > bStart;
    });

    slots.push({
      startTime: slotStart,
      endTime:   slotEnd,
      available: !hasConflict,
    });

    cursor = new Date(cursor.getTime() + STEP_MS);
  }

  return slots;
}

/**
 * Check if a proposed booking slot conflicts with any existing bookings.
 * @param userId    - The host's user ID
 * @param startTime - Proposed start time (UTC Date)
 * @param endTime   - Proposed end time   (UTC Date)
 * @returns true if there IS a conflict, false if the slot is free
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
        // Booking starts inside the proposed window
        { startTime: { gte: startTime, lt: endTime } },
        // Booking ends inside the proposed window
        { endTime: { gt: startTime, lte: endTime } },
        // Proposed window is entirely inside an existing booking
        { startTime: { lte: startTime }, endTime: { gte: endTime } },
      ],
    },
  });

  return !!conflict;
}

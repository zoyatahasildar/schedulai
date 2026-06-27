// lib/slots.ts
// Time slot generation logic
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Branch: feature/calendar
// ═══════════════════════════════════════════════
// TODO Member 3:
// 1. generateSlots(userId, date, duration) → TimeSlot[]
// 2. checkTimeConflict(userId, startTime, endTime) → boolean
// 3. convertToUserTimezone(date, timezone) → Date
// ═══════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/types";

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
  // TODO Member 3: Implement this function
  // Steps:
  // 1. Get user's availability for that day of week
  // 2. Get existing bookings for that date
  // 3. Generate 30-min interval slots within available hours
  // 4. Mark slots as unavailable if they overlap with existing bookings
  // 5. Return the array of TimeSlot objects

  const slots: TimeSlot[] = [];
  return slots; // Placeholder
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
  // TODO Member 3: Implement this function
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

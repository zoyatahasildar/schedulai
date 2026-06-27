// app/api/booking/slots/route.ts
// Available-slots API — computes bookable slots for an event type on a date
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// GET /api/booking/slots?eventTypeId=xxx&date=YYYY-MM-DD
//   - Reads the host's weekly Availability (Member 3's model) for that weekday
//   - Excludes times that overlap existing PENDING/CONFIRMED bookings
//   - All times computed and returned in UTC (per team rule #1)
//
// Note: lib/slots.ts#generateSlots (Member 3) is still a stub, so the
// Booking Engine computes slots here to stay unblocked without modifying
// another module's file. We only *reuse* their checkTimeConflict helper shape.
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/types";

// Slot granularity in minutes (start times are offered every STEP minutes)
const SLOT_STEP_MINUTES = 30;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventTypeId = searchParams.get("eventTypeId");
    const date = searchParams.get("date");

    if (!eventTypeId || !date) {
      return NextResponse.json(
        { success: false, error: "eventTypeId and date are required" },
        { status: 400 }
      );
    }

    if (!DATE_RE.test(date)) {
      return NextResponse.json(
        { success: false, error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    // Day boundaries in UTC
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    const dayOfWeek = dayStart.getUTCDay();

    // Host availability windows for this weekday
    const windows = await prisma.availability.findMany({
      where: { userId: eventType.userId, dayOfWeek, isActive: true },
    });

    // Existing bookings that could block slots on this day
    const existing = await prisma.booking.findMany({
      where: {
        eventType: { userId: eventType.userId },
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
        offset + eventType.duration <= endMin;
        offset += SLOT_STEP_MINUTES
      ) {
        const slotStart = new Date(dayStart.getTime() + offset * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + eventType.duration * 60 * 1000);

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

    return NextResponse.json({
      success: true,
      data: {
        date,
        eventType: {
          id: eventType.id,
          title: eventType.title,
          duration: eventType.duration,
          price: eventType.price,
        },
        slots,
      },
    });
  } catch (error) {
    console.error("Slots API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load available slots" },
      { status: 500 }
    );
  }
}

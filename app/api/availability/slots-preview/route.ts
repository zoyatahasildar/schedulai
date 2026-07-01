// app/api/availability/slots-preview/route.ts
// API to generate availability preview slots (available, booked, unavailable) for the current user
// Consumed by the "Create New Event Type" Availability Slots Preview UI

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLOT_STEP_MINUTES = 30;

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const durationStr = searchParams.get("duration");

    if (!dateStr || !durationStr) {
      return NextResponse.json(
        { success: false, error: "date and duration are required" },
        { status: 400 }
      );
    }

    if (!DATE_RE.test(dateStr)) {
      return NextResponse.json(
        { success: false, error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const duration = Number(durationStr);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { success: false, error: "duration must be a positive number" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Day boundaries in UTC
    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
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
      select: {
        startTime: true,
        endTime: true,
        guestName: true,
        guestEmail: true,
      },
    });

    const now = new Date();
    const slots = [];

    // Loop through 48 intervals (every 30 mins) of the day
    for (let offset = 0; offset < 24 * 60; offset += SLOT_STEP_MINUTES) {
      const slotStart = new Date(dayStart.getTime() + offset * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

      // 1. Check for overlap with existing bookings
      const bookingOverlap = existing.find(
        (b) => slotStart < b.endTime && slotEnd > b.startTime
      );

      let status: "available" | "booked" | "unavailable" = "unavailable";
      let bookingDetails = null;

      if (bookingOverlap) {
        status = "booked";
        bookingDetails = {
          guestName: bookingOverlap.guestName,
          guestEmail: bookingOverlap.guestEmail,
        };
      } else if (slotStart > now) {
        // 2. Check if it fits within any active availability window
        const startMin = offset;
        const endMin = offset + duration;

        const fitsInWindow = windows.some((w) => {
          const wStart = toMinutes(w.startTime);
          const wEnd = toMinutes(w.endTime);
          if (wStart === null || wEnd === null || wEnd <= wStart) return false;
          return startMin >= wStart && endMin <= wEnd;
        });

        if (fitsInWindow) {
          status = "available";
        }
      }

      // Format time as HH:MM
      const hh = slotStart.getUTCHours().toString().padStart(2, "0");
      const mm = slotStart.getUTCMinutes().toString().padStart(2, "0");
      const timeStr = `${hh}:${mm}`;

      slots.push({
        time: timeStr,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        status,
        booking: bookingDetails,
      });
    }

    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error("[slots-preview] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load slots preview" },
      { status: 500 }
    );
  }
}

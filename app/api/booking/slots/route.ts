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
// Note: Consolidated to use the shared lib/slots.ts#generateSlots.
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/slots";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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

    const slots = await generateSlots(eventType.userId, date, eventType.duration);

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

// app/api/booking/route.ts
// Booking API — create and manage bookings
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// TODO Member 2:
// POST /api/booking → create a new booking
//   - Validate input (name, email, startTime, eventTypeId)
//   - Check for conflicts using checkTimeConflict()
//   - Create booking in DB
//   - Trigger email notification → call /api/notifications
//   - Return booking confirmation
//
// GET /api/booking → list bookings (for dashboard)
// PATCH /api/booking → update status (confirm/cancel)
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Create a new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestEmail, guestPhone, notes, startTime, eventTypeId } = body;

    // Validate required fields
    if (!guestName || !guestEmail || !startTime || !eventTypeId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch event type to get duration
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + eventType.duration * 60 * 1000);

    // TODO Member 2: Add conflict checking here
    // const hasConflict = await checkTimeConflict(eventType.userId, start, end);

    const booking = await prisma.booking.create({
      data: {
        guestName,
        guestEmail,
        guestPhone,
        notes,
        startTime: start,
        endTime: end,
        eventTypeId,
        status: "CONFIRMED",
      },
      include: { eventType: { include: { user: true } } },
    });

    // TODO Member 2: Call email notification API
    // await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ bookingId: booking.id }) });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET: List bookings for authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventType: { userId: session.user.id } },
      include: { eventType: true },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

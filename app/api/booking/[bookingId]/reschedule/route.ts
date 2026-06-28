// app/api/booking/[bookingId]/reschedule/route.ts
// Reschedule a booking to a new slot (guest-facing).
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST /api/booking/[bookingId]/reschedule
//   Body: { startTime: string (ISO, UTC) }
//   - Validates the new start time (must be valid + in the future).
//   - Conflict-checks against the host's other PENDING/CONFIRMED bookings
//     (excluding THIS booking so it never conflicts with itself).
//   - Updates the booking's start/end (status reset to CONFIRMED).
//   - Appends a RESCHEDULED history entry (old → new times).
//   - Fires Member 4's reschedule email endpoint (non-blocking).
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function triggerRescheduleEmail(
  bookingId: string,
  previousStartTime: Date,
  previousEndTime: Date
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) return;
    await fetch(`${baseUrl}/api/notifications/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        previousStartTime: previousStartTime.toISOString(),
        previousEndTime: previousEndTime.toISOString(),
      }),
    });
  } catch (err) {
    console.error("Reschedule notification failed (non-fatal):", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const body = await req.json();
    const { startTime } = body;

    if (!startTime) {
      return NextResponse.json(
        { success: false, error: "startTime is required" },
        { status: 400 }
      );
    }

    const newStart = new Date(startTime);
    if (Number.isNaN(newStart.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start time" },
        { status: 400 }
      );
    }

    if (newStart.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: "New start time must be in the future" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { eventType: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
      return NextResponse.json(
        { success: false, error: "This booking can no longer be rescheduled" },
        { status: 409 }
      );
    }

    const newEnd = new Date(newStart.getTime() + booking.eventType.duration * 60 * 1000);

    // Conflict check against the host's OTHER active bookings (exclude self)
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        eventType: { userId: booking.eventType.userId },
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
      select: { id: true },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: "That time slot is no longer available" },
        { status: 409 }
      );
    }

    const prevStart = booking.startTime;
    const prevEnd = booking.endTime;

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        // Preserve current status: a PENDING request stays PENDING (still needs
        // host approval), a CONFIRMED booking stays CONFIRMED.
        startTime: newStart,
        endTime: newEnd,
        history: {
          create: {
            action: "RESCHEDULED",
            previousStartTime: prevStart,
            previousEndTime: prevEnd,
            newStartTime: newStart,
            newEndTime: newEnd,
          },
        },
      },
      include: {
        eventType: { include: { user: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
    });

    // Email guest + host with old → new times (after the update, per contract)
    await triggerRescheduleEmail(updated.id, prevStart, prevEnd);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Reschedule booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reschedule booking" },
      { status: 500 }
    );
  }
}

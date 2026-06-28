// app/api/booking/route.ts
// Booking API — create and manage bookings
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST  /api/booking → create a new booking (validation + conflict check + notify + history)
// GET   /api/booking → list bookings (for dashboard, auth required)
// PATCH /api/booking → update status (confirm/cancel; records history on cancel)
//
// Per-booking guest actions live in nested routes (same module):
//   GET  /api/booking/[bookingId]            → single booking + history
//   POST /api/booking/[bookingId]/cancel     → cancel (status → CANCELLED, history, email)
//   POST /api/booking/[bookingId]/reschedule → move to a new slot (history, email)
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkTimeConflict } from "@/lib/slots";
import type { BookingStatus } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST: Create a new booking REQUEST.
// Approval workflow: bookings start as PENDING and the host must accept them
// (see /api/booking/[bookingId]/accept) before a confirmation email is sent.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestEmail, guestPhone, notes, startTime, eventTypeId } = body;

    // ─── Validation ─────────────────────────────────────
    if (!guestName || !guestEmail || !startTime || !eventTypeId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(String(guestEmail))) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start time" },
        { status: 400 }
      );
    }

    if (start.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: "Start time must be in the future" },
        { status: 400 }
      );
    }

    // Fetch event type to get duration + owner
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    const end = new Date(start.getTime() + eventType.duration * 60 * 1000);

    // ─── Conflict checking (reuses Member 3's helper) ───
    const hasConflict = await checkTimeConflict(eventType.userId, start, end);
    if (hasConflict) {
      return NextResponse.json(
        { success: false, error: "That time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create booking + its first history entry atomically
    const booking = await prisma.booking.create({
      data: {
        guestName: String(guestName).trim(),
        guestEmail: String(guestEmail).trim(),
        guestPhone: guestPhone ? String(guestPhone).trim() : null,
        notes: notes ? String(notes).trim() : null,
        startTime: start,
        endTime: end,
        eventTypeId,
        status: "PENDING", // awaits host approval
        history: {
          create: {
            action: "CREATED",
            newStartTime: start,
            newEndTime: end,
          },
        },
      },
      include: { eventType: { include: { user: true } } },
    });

    // No confirmation email here — the request is PENDING. The confirmation
    // email is sent when the host accepts the request.

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

// PATCH: Update a booking's status (confirm / cancel / complete) — host dashboard
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status } = await req.json();

    const allowed: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!bookingId || !status || !allowed.includes(status)) {
      return NextResponse.json(
        { success: false, error: "bookingId and a valid status are required" },
        { status: 400 }
      );
    }

    // Ensure the booking belongs to the authenticated host
    const existing = await prisma.booking.findFirst({
      where: { id: bookingId, eventType: { userId: session.user.id } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        // Record a history entry when a host cancels from the dashboard
        ...(status === "CANCELLED" && existing.status !== "CANCELLED"
          ? {
              history: {
                create: {
                  action: "CANCELLED",
                  reason: "Cancelled by host",
                  previousStartTime: existing.startTime,
                  previousEndTime: existing.endTime,
                },
              },
            }
          : {}),
      },
      include: { eventType: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

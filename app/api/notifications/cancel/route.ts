// app/api/notifications/cancel/route.ts
// Cancellation email notification API
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 4 (Notifications + Email module)
// Branch: feature/notifications-v2
// ═══════════════════════════════════════════════
// POST /api/notifications/cancel
//   Body: { bookingId: string }
//   - Loads the booking, sends a cancellation email to guest + host.
//   - Email-only: it does NOT change booking status (that stays in
//     Member 2's booking engine). Call this AFTER the status is set
//     to CANCELLED so the two stay in sync.
//   - Self-contained in Member 4's module — no edits to other modules.
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { eventType: { include: { user: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const result = await sendCancellationEmail({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hostName: booking.eventType.user.name ?? "Your Host",
      hostEmail: booking.eventType.user.email,
      eventTitle: booking.eventType.title,
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Cancellation notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send cancellation emails" },
      { status: 500 }
    );
  }
}

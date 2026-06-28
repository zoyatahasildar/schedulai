// app/api/booking/[bookingId]/cancel/route.ts
// Cancel a booking (guest-facing) — status only, never deletes the row.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST /api/booking/[bookingId]/cancel
//   Body (optional): { reason?: string }
//   - Sets status → CANCELLED (the booking row is preserved).
//   - Appends a CANCELLED entry to booking history.
//   - Fires Member 4's cancellation email endpoint (non-blocking).
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function triggerCancelEmail(bookingId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) return;
    await fetch(`${baseUrl}/api/notifications/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (err) {
    console.error("Cancel notification failed (non-fatal):", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body?.reason ? String(body.reason).trim() : undefined;
    } catch {
      // body is optional
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Idempotent: already cancelled → just report success
    if (booking.status === "CANCELLED") {
      return NextResponse.json({
        success: true,
        data: booking,
        alreadyCancelled: true,
      });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        history: {
          create: {
            action: "CANCELLED",
            reason: reason || "Cancelled by guest",
            previousStartTime: booking.startTime,
            previousEndTime: booking.endTime,
          },
        },
      },
      include: {
        eventType: { include: { user: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
    });

    // Email guest + host (after status is set, per Member 4's contract)
    await triggerCancelEmail(updated.id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

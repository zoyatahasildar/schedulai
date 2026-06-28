// app/api/booking/[bookingId]/reject/route.ts
// Host rejects a pending booking request → REJECTED.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST /api/booking/[bookingId]/reject   (host auth required)
//   Body (optional): { reason?: string }
//   - Only the host who owns the event type may reject.
//   - Sets status → REJECTED (row preserved), appends a REJECTED history entry.
//   - Fires Member 4's cancellation/decline email (non-blocking).
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function triggerDeclineEmail(bookingId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) return;
    await fetch(`${baseUrl}/api/notifications/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (err) {
    console.error("Decline notification failed (non-fatal):", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body?.reason ? String(body.reason).trim() : undefined;
    } catch {
      // body is optional
    }

    const booking = await prisma.booking.findFirst({
      where: { id: params.bookingId, eventType: { userId: session.user.id } },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "REJECTED") {
      return NextResponse.json({ success: true, data: booking, alreadyRejected: true });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `Cannot reject a ${booking.status.toLowerCase()} booking` },
        { status: 409 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "REJECTED",
        history: {
          create: {
            action: "REJECTED",
            reason: reason || "Request declined by host",
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

    await triggerDeclineEmail(updated.id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Reject booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject booking" },
      { status: 500 }
    );
  }
}

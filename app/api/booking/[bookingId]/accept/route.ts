// app/api/booking/[bookingId]/accept/route.ts
// Host accepts a pending booking request → CONFIRMED.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST /api/booking/[bookingId]/accept   (host auth required)
//   - Only the host who owns the event type may accept.
//   - PENDING → CONFIRMED, appends an ACCEPTED history entry.
//   - Fires Member 4's confirmation email (non-blocking).
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function triggerConfirmationEmail(bookingId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) return;
    await fetch(`${baseUrl}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (err) {
    console.error("Confirmation notification failed (non-fatal):", err);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Scope to the authenticated host (ownership check)
    const booking = await prisma.booking.findFirst({
      where: { id: params.bookingId, eventType: { userId: session.user.id } },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ success: true, data: booking, alreadyAccepted: true });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `Cannot accept a ${booking.status.toLowerCase()} booking` },
        { status: 409 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        history: {
          create: {
            action: "ACCEPTED",
            reason: "Request accepted by host",
            newStartTime: booking.startTime,
            newEndTime: booking.endTime,
          },
        },
      },
      include: {
        eventType: { include: { user: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
    });

    await triggerConfirmationEmail(updated.id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Accept booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to accept booking" },
      { status: 500 }
    );
  }
}

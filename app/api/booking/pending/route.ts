// app/api/booking/pending/route.ts
// Pending booking requests for the authenticated host.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// GET /api/booking/pending   (host auth required)
//   → { bookings: [...PENDING with event type...], count }
//
// Note: "pending" is a static segment so it takes precedence over the
// dynamic /api/booking/[bookingId] route — no collision.
// ═══════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        eventType: { userId: session.user.id },
      },
      include: { eventType: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { bookings, count: bookings.length },
    });
  } catch (error) {
    console.error("Pending bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load pending requests" },
      { status: 500 }
    );
  }
}

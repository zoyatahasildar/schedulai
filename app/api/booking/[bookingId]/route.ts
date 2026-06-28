// app/api/booking/[bookingId]/route.ts
// Single booking lookup (public, by id) — used by the manage/reschedule UI.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// GET /api/booking/[bookingId] → booking + event type + full history (newest first)
//
// Guest-facing: scoped to a single cuid, so no session is required (the id is
// the capability, same model as the public booking link).
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: {
        eventType: { include: { user: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

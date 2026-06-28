// app/api/booking/pending/count/route.ts
// Lightweight pending-request counter (for badges).
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// GET /api/booking/pending/count   (host auth required)
//   → { count }   — cheap COUNT query, ideal for a nav/badge poll.
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

    const count = await prisma.booking.count({
      where: {
        status: "PENDING",
        eventType: { userId: session.user.id },
      },
    });

    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    console.error("Pending count error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to count pending requests" },
      { status: 500 }
    );
  }
}

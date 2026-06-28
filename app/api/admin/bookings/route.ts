// app/api/admin/bookings/route.ts
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// Branch: feature/admin
// ═══════════════════════════════════════════════
// GET /api/admin/bookings
// Returns all bookings for the logged-in host:
//   { id, guestName, guestEmail, status, startTime, eventType: { title } }
// Scoped via eventType.userId === session.user.id
// ═══════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const bookings = await prisma.booking.findMany({
      where: { eventType: { userId } },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        status: true,
        startTime: true,
        eventType: { select: { title: true } },
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Admin bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bookings" },
      { status: 500 }
    );
  }
}

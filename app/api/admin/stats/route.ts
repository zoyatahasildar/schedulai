// app/api/admin/stats/route.ts
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// Branch: feature/admin
// ═══════════════════════════════════════════════
// GET /api/admin/stats
// Returns: { totalBookings, monthlyBookings, totalRevenue, mostPopularEventType }
// All queries scoped to the logged-in host via eventType.userId === session.user.id
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
    const scope = { eventType: { userId } } as const;

    // Current calendar month boundaries (UTC — all times are stored in UTC).
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [totalBookings, monthlyBookings, realizedBookings, grouped] = await Promise.all([
      // Total bookings (all statuses) for this host
      prisma.booking.count({ where: scope }),

      // Bookings scheduled this month
      prisma.booking.count({
        where: { ...scope, startTime: { gte: startOfMonth, lt: startOfNextMonth } },
      }),

      // Revenue source: price lives on EventType, not Booking.
      // Count realized revenue from CONFIRMED + COMPLETED bookings.
      prisma.booking.findMany({
        where: { ...scope, status: { in: ["CONFIRMED", "COMPLETED"] } },
        select: { eventType: { select: { price: true } } },
      }),

      // Most popular event type = the eventTypeId with the most bookings
      prisma.booking.groupBy({
        by: ["eventTypeId"],
        where: scope,
        _count: { eventTypeId: true },
        orderBy: { _count: { eventTypeId: "desc" } },
        take: 1,
      }),
    ]);

    const totalRevenue = realizedBookings.reduce(
      (sum, b) => sum + (b.eventType?.price ?? 0),
      0
    );

    let mostPopularEventType: string | null = null;
    if (grouped.length > 0) {
      const top = await prisma.eventType.findUnique({
        where: { id: grouped[0].eventTypeId },
        select: { title: true },
      });
      mostPopularEventType = top?.title ?? null;
    }

    return NextResponse.json({
      success: true,
      data: { totalBookings, monthlyBookings, totalRevenue, mostPopularEventType },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}

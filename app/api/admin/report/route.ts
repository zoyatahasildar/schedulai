// app/api/admin/report/route.ts
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// Branch: feature/admin
// ═══════════════════════════════════════════════
// GET /api/admin/report
// Aggregates the last 7 days of bookings for the logged-in host:
//   { totalMeetings, busiestDay, revenue, topEventType }
// Scoped via eventType.userId === session.user.id
// ═══════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Last 7 days window (UTC).
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        eventType: { userId },
        startTime: { gte: sevenDaysAgo, lte: now },
      },
      select: {
        startTime: true,
        status: true,
        eventType: { select: { title: true, price: true } },
      },
    });

    const totalMeetings = bookings.length;

    // Busiest day of week (by meeting start time, UTC).
    const dayCounts: Record<string, number> = {};
    for (const b of bookings) {
      const day = DAY_NAMES[new Date(b.startTime).getUTCDay()];
      dayCounts[day] = (dayCounts[day] ?? 0) + 1;
    }
    let busiestDay: string | null = null;
    let busiestCount = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > busiestCount) {
        busiestCount = count;
        busiestDay = day;
      }
    }

    // Realized revenue (CONFIRMED + COMPLETED); price comes from EventType.
    const revenue = bookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.eventType?.price ?? 0), 0);

    // Top event type by booking count in the window.
    const typeCounts: Record<string, number> = {};
    for (const b of bookings) {
      const title = b.eventType?.title ?? "Unknown";
      typeCounts[title] = (typeCounts[title] ?? 0) + 1;
    }
    let topEventType: string | null = null;
    let topCount = 0;
    for (const [title, count] of Object.entries(typeCounts)) {
      if (count > topCount) {
        topCount = count;
        topEventType = title;
      }
    }

    return NextResponse.json({
      success: true,
      data: { totalMeetings, busiestDay, revenue, topEventType },
    });
  } catch (error) {
    console.error("Admin report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to build weekly report" },
      { status: 500 }
    );
  }
}

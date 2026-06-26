// app/api/admin/route.ts
// Admin analytics API
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// Branch: feature/admin
// ═══════════════════════════════════════════════
// TODO Member 5:
// GET /api/admin/stats → booking counts, revenue, trends
// GET /api/admin/chart → bookings per day data for charts
// GET /api/admin/summary → AI weekly summary from Gemini
// GET /api/admin/export → CSV export of all bookings
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "stats";

    if (type === "stats") {
      const [total, confirmed, cancelled, pending] = await Promise.all([
        prisma.booking.count({ where: { eventType: { userId: session.user.id } } }),
        prisma.booking.count({ where: { eventType: { userId: session.user.id }, status: "CONFIRMED" } }),
        prisma.booking.count({ where: { eventType: { userId: session.user.id }, status: "CANCELLED" } }),
        prisma.booking.count({ where: { eventType: { userId: session.user.id }, status: "PENDING" } }),
      ]);

      return NextResponse.json({
        success: true,
        data: { total, confirmed, cancelled, pending },
      });
    }

    // TODO Member 5: Add chart data, AI summary, CSV export

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { success: false, error: "Admin API error" },
      { status: 500 }
    );
  }
}

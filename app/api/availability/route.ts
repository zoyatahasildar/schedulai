// app/api/availability/route.ts
// Availability API — get and set host availability
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Branch: feature/calendar
// ═══════════════════════════════════════════════
// TODO Member 3:
// GET /api/availability?userId=xxx → return user's weekly schedule
// POST /api/availability → save/update user's availability
// GET /api/availability/slots?eventTypeId=xxx&date=xxx → return available slots
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch availability for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: { userId, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error("Fetch availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST: Save user availability
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { availability } = await req.json();
    // availability: Array<{ dayOfWeek: number, startTime: string, endTime: string, isActive: boolean }>

    // Delete existing and re-create (upsert pattern)
    await prisma.availability.deleteMany({ where: { userId: session.user.id } });

    const created = await prisma.availability.createMany({
      data: availability.map((a: any) => ({
        ...a,
        userId: session.user.id,
      })),
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("Save availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save availability" },
      { status: 500 }
    );
  }
}

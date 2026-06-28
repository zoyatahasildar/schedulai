// app/api/availability/slots/route.ts
// Available time slots API — consumed by Member 2's booking page
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Branch: feat/calendar-slots
// ═══════════════════════════════════════════════
//
// Contract with Member 2:
//   GET /api/availability/slots?username=x&eventTypeId=y&date=YYYY-MM-DD
//   → { slots: ["09:00", "09:30", "10:00", ...] }   (UTC time strings)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username    = searchParams.get("username");
    const eventTypeId = searchParams.get("eventTypeId");
    const date        = searchParams.get("date"); // expects YYYY-MM-DD

    // ── Validation ────────────────────────────────────────────────────────
    if (!username || !eventTypeId || !date) {
      return NextResponse.json(
        { success: false, error: "username, eventTypeId, and date are required" },
        { status: 400 }
      );
    }

    // Basic date format check (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Reject dates in the past
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const requestedDate = new Date(`${date}T00:00:00Z`);
    if (requestedDate < today) {
      return NextResponse.json(
        { success: false, error: "Cannot book slots in the past" },
        { status: 400 }
      );
    }

    // ── Resolve username → user ───────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where:  { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Host not found" },
        { status: 404 }
      );
    }

    // ── Fetch event type for duration ────────────────────────────────────
    const eventType = await prisma.eventType.findFirst({
      where:  { id: eventTypeId, userId: user.id, isActive: true },
      select: { duration: true },
    });

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: "Event type not found or inactive" },
        { status: 404 }
      );
    }

    // ── Generate slots ───────────────────────────────────────────────────
    const allSlots = await generateSlots(user.id, date, eventType.duration);

    // Return only AVAILABLE slots as "HH:MM" UTC strings (M2 contract)
    const slots = allSlots
      .filter((s) => s.available)
      .map((s) => {
        const d  = new Date(s.startTime);
        const hh = d.getUTCHours().toString().padStart(2, "0");
        const mm = d.getUTCMinutes().toString().padStart(2, "0");
        return `${hh}:${mm}`;
      });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[availability/slots] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate available slots" },
      { status: 500 }
    );
  }
}

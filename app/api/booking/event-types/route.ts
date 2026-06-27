// app/api/booking/event-types/route.ts
// Event Type API — create and list event types for the host
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST /api/booking/event-types → create a new event type (auth required)
// GET  /api/booking/event-types → list the authenticated host's event types
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Create a new event type
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, duration, price } = body;

    // ─── Validation ─────────────────────────────────────
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const parsedDuration = Number(duration);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      return NextResponse.json(
        { success: false, error: "Duration must be a positive number of minutes" },
        { status: 400 }
      );
    }

    const parsedPrice = price === undefined || price === null || price === "" ? 0 : Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { success: false, error: "Price must be zero or a positive number" },
        { status: 400 }
      );
    }

    const eventType = await prisma.eventType.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        duration: Math.round(parsedDuration),
        price: parsedPrice,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: eventType }, { status: 201 });
  } catch (error) {
    console.error("Create event type error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event type" },
      { status: 500 }
    );
  }
}

// GET: List the authenticated host's event types
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: eventTypes });
  } catch (error) {
    console.error("List event types error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list event types" },
      { status: 500 }
    );
  }
}

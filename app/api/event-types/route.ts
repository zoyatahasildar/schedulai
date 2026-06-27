// app/api/event-types/route.ts
// Event Types CRUD API
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — fetch all event types for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(eventTypes);
  } catch (error) {
    console.error("GET event types error:", error);
    return NextResponse.json({ error: "Failed to fetch event types" }, { status: 500 });
  }
}

// POST — create a new event type
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, duration, price } = await req.json();

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!duration || isNaN(parseInt(duration))) {
      return NextResponse.json({ error: "Duration is required" }, { status: 400 });
    }

    const eventType = await prisma.eventType.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        duration: parseInt(duration),
        price: parseFloat(price) || 0,
        userId: session.user.id,
        isActive: true,
      },
    });

    return NextResponse.json(eventType, { status: 201 });
  } catch (error) {
    console.error("POST event type error:", error);
    return NextResponse.json({ error: "Failed to create event type" }, { status: 500 });
  }
}

// PATCH — update or toggle an event type
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive, title, description, duration, price } = body;

    if (!id) {
      return NextResponse.json({ error: "Event type ID is required" }, { status: 400 });
    }

    // Verify the event type belongs to this user
    const existing = await prisma.eventType.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event type not found" }, { status: 404 });
    }

    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(price !== undefined && { price: parseFloat(price) || 0 }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH event type error:", error);
    return NextResponse.json({ error: "Failed to update event type" }, { status: 500 });
  }
}

// DELETE — delete an event type
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event type ID is required" }, { status: 400 });
    }

    // Verify the event type belongs to this user
    const existing = await prisma.eventType.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event type not found" }, { status: 404 });
    }

    await prisma.eventType.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE event type error:", error);
    return NextResponse.json({ error: "Failed to delete event type" }, { status: 500 });
  }
}

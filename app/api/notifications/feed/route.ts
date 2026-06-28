// app/api/notifications/feed/route.ts
// In-app notification feed for the signed-in host.
// Returns bookings and event-type CRUD activity as two separate categories.
// Owned by: Lead

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ notifications: [], bookings: [], events: [] }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [bookingRows, eventRows] = await Promise.all([
    prisma.booking.findMany({
      where: { eventType: { userId: session.user.id } },
      include: { eventType: true },
      orderBy: { updatedAt: "desc" },
      take: 15,
    }),
    prisma.eventType.findMany({
      where: {
        userId: session.user.id,
        updatedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const bookings = bookingRows.map((b) => {
    let type: "new" | "cancelled" | "completed" | "pending" = "new";
    let title = "New booking";
    if (b.status === "CANCELLED") {
      type = "cancelled";
      title = "Booking cancelled";
    } else if (b.status === "COMPLETED") {
      type = "completed";
      title = "Meeting completed";
    } else if (b.status === "PENDING") {
      type = "pending";
      title = "New booking request";
    }
    return {
      id: b.id,
      type,
      title,
      message: `${b.guestName} · ${b.eventType.title}`,
      at: b.updatedAt.toISOString(),
      category: "booking" as const,
    };
  });

  const events = eventRows.map((e) => {
    const isNew = Math.abs(e.updatedAt.getTime() - e.createdAt.getTime()) < 5000;
    const type = !e.isActive
      ? "event_deactivated"
      : isNew
        ? "event_created"
        : "event_updated";
    const title = !e.isActive
      ? "Event type deactivated"
      : isNew
        ? "Event type created"
        : "Event type updated";
    return {
      id: `et-${e.id}`,
      type,
      title,
      message: e.title,
      at: e.updatedAt.toISOString(),
      category: "event" as const,
    };
  });

  const notifications = [...bookings, ...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return NextResponse.json({ notifications, bookings, events });
}

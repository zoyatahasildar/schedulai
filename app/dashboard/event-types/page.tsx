// app/dashboard/event-types/page.tsx
// Event Types — real data, ScheduleAI design
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventTypesClient } from "@/components/dashboard/EventTypesClient";

export default async function EventTypesPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  const data = eventTypes.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    duration: e.duration,
    price: e.price,
    isActive: e.isActive,
    bookings: e._count.bookings,
  }));

  return (
    <EventTypesClient
      userId={user.id}
      initialEvents={data}
      username={user.username ?? null}
      appUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
    />
  );
}

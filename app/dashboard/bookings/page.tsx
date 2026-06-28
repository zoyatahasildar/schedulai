// app/dashboard/bookings/page.tsx
// Bookings — real data, ScheduleAI design
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingsClient } from "@/components/dashboard/BookingsClient";

const PALETTE = ["#6C63FF", "#00D4FF", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6"];

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const bookings = await prisma.booking.findMany({
    where: { eventType: { userId: user.id } },
    include: { eventType: true },
    orderBy: { startTime: "desc" },
  });

  const data = bookings.map((b, i) => ({
    id: b.id,
    name: b.guestName,
    email: b.guestEmail,
    type: b.eventType.title,
    duration: b.eventType.duration,
    startTime: b.startTime.toISOString(),
    status: b.status.toLowerCase() as "confirmed" | "pending" | "cancelled" | "completed",
    price: b.eventType.price,
    color: PALETTE[i % PALETTE.length],
  }));

  return <BookingsClient initialBookings={data} />;
}

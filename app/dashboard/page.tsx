// app/dashboard/page.tsx
// Dashboard home — real data, ChronoAI design
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

const PALETTE = ["#6C63FF", "#00D4FF", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];

function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  // Start of week (Monday, UTC)
  const dow = (startOfToday.getUTCDay() + 6) % 7;
  const startOfWeek = new Date(startOfToday.getTime() - dow * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [total, todayCount, weekCount, monthBookings, upcomingRaw, todayRaw] = await Promise.all([
    prisma.booking.count({ where: { eventType: { userId: user.id } } }),
    prisma.booking.count({
      where: { eventType: { userId: user.id }, startTime: { gte: startOfToday, lt: endOfToday } },
    }),
    prisma.booking.count({
      where: { eventType: { userId: user.id }, startTime: { gte: startOfWeek } },
    }),
    prisma.booking.findMany({
      where: { eventType: { userId: user.id }, status: "CONFIRMED", createdAt: { gte: startOfMonth } },
      include: { eventType: true },
    }),
    prisma.booking.findMany({
      where: {
        eventType: { userId: user.id },
        startTime: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { eventType: true },
      orderBy: { startTime: "asc" },
      take: 4,
    }),
    prisma.booking.findMany({
      where: { eventType: { userId: user.id }, startTime: { gte: startOfToday, lt: endOfToday } },
      include: { eventType: true },
      orderBy: { startTime: "asc" },
      take: 6,
    }),
  ]);

  const revenue = monthBookings.reduce((sum, b) => sum + (b.eventType?.price ?? 0), 0);

  const upcoming = upcomingRaw.map((b, i) => ({
    name: b.guestName,
    time: `${fmtTime(b.startTime)} UTC`,
    duration: `${b.eventType.duration} min`,
    status: b.status.toLowerCase(),
    color: PALETTE[i % PALETTE.length],
  }));

  const schedule = todayRaw.map((b, i) => ({
    time: fmtTime(b.startTime),
    title: b.eventType.title,
    client: b.guestName,
    duration: `${b.eventType.duration} min`,
    color: PALETTE[i % PALETTE.length],
  }));

  const bookingUrl = user.username
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/book/${user.username}`
    : null;

  return (
    <DashboardClient
      userName={user.name ?? "there"}
      stats={{ total, today: todayCount, week: weekCount, revenue: Math.round(revenue) }}
      upcoming={upcoming}
      schedule={schedule}
      bookingUrl={bookingUrl}
    />
  );
}

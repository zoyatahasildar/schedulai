// Analytics — real data computed from bookings, ScheduleAI design
// Owned by: Member 5 / Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";

const PALETTE = ["#6C63FF", "#00D4FF", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6"];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = session.user;

  const bookings = await prisma.booking.findMany({
    where: { eventType: { userId: user.id } },
    include: { eventType: true },
  });

  const now = new Date();
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const active = confirmed + pending;
  const revenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + (b.eventType?.price ?? 0), 0);
  const conversion = total > 0 ? Math.round(((confirmed + completed) / total) * 100) : 0;

  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
      label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      count: 0,
    });
  }

  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const m = months.find(
      (x) => x.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    );
    if (m) m.count++;
  });

  const trend = months.map((m) => ({
    month: m.label,
    count: m.count,
  }));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  bookings.forEach((b) => {
    dayCounts[new Date(b.startTime).getUTCDay()]++;
  });

  const order = [1, 2, 3, 4, 5, 6, 0];

  const byDay = order.map((wd) => ({
    day: dayNames[wd],
    bookings: dayCounts[wd],
  }));

  const typeMap = new Map<string, number>();

  bookings.forEach((b) => {
    typeMap.set(
      b.eventType.title,
      (typeMap.get(b.eventType.title) ?? 0) + 1
    );
  });

  const byType = [...typeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({
      name,
      value,
      color: PALETTE[i % PALETTE.length],
    }));

  const heat = Array.from({ length: 5 }, () => Array(7).fill(0));

  const today0 = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const d0 = Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate()
    );

    const daysAgo = Math.floor((today0 - d0) / 86400000);

    if (daysAgo >= 0 && daysAgo < 35) {
      const wk = 4 - Math.floor(daysAgo / 7);
      if (wk >= 0 && wk < 5) {
        heat[wk][d.getUTCDay()]++;
      }
    }
  });

  const inLastDays = (lo: number, hi: number) =>
    bookings.filter((b) => {
      const d0 = Date.UTC(
        new Date(b.createdAt).getUTCFullYear(),
        new Date(b.createdAt).getUTCMonth(),
        new Date(b.createdAt).getUTCDate()
      );

      const daysAgo = Math.floor((today0 - d0) / 86400000);

      return daysAgo >= lo && daysAgo < hi;
    }).length;

  const thisWeek = inLastDays(0, 7);
  const lastWeek = inLastDays(7, 14);

  const growth =
    lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      : thisWeek > 0
        ? 100
        : 0;

  const busiest = byDay.reduce(
    (a, b) => (b.bookings > a.bookings ? b : a),
    byDay[0] ?? { day: "—", bookings: 0 }
  );

  return (
    <div className="min-h-screen bg-[#E8EDF4]">
      <DashboardNav user={user} />
      <AnalyticsClient
        kpis={{ total, active, revenue: Math.round(revenue), conversion }}
        trend={trend}
        byDay={byDay}
        byType={byType}
        heat={heat}
        brief={{
          thisWeek,
          growth,
          busiestDay: busiest.day,
          topType: byType[0]?.name ?? null,
        }}
      />
    </div>
  );
}
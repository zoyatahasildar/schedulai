// app/admin/page.tsx
<<<<<<< HEAD
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Production-style Admin UI — CLIENT-SAFE.
// No Prisma, no server fetch, no API calls. Hardcoded mock data only.
// Loading skeletons + crash-proof guards + SaaS polish (Tailwind only).
// ═══════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  DollarSign,
  Star,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ChartCard } from "@/components/charts/ChartCard";
import { WeeklyBookingsBarChart } from "@/components/charts/WeeklyBookingsBarChart";
import { BookingStatusPieChart } from "@/components/charts/BookingStatusPieChart";

// ─── HARDCODED MOCK DATA ───────────────────────────────
interface StatCard {
  id: string;
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
  accent: string;
}
=======
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

  // Monthly trend (last 6 months by createdAt)
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), count: 0 });
  }
  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const m = months.find((x) => x.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (m) m.count++;
  });
  const trend = months.map((m) => ({ month: m.label, count: m.count }));

  // Bookings by weekday (from startTime)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  bookings.forEach((b) => { dayCounts[new Date(b.startTime).getUTCDay()]++; });
  const order = [1, 2, 3, 4, 5, 6, 0];
  const byDay = order.map((wd) => ({ day: dayNames[wd], bookings: dayCounts[wd] }));

  // By event type
  const typeMap = new Map<string, number>();
  bookings.forEach((b) => typeMap.set(b.eventType.title, (typeMap.get(b.eventType.title) ?? 0) + 1));
  const byType = [...typeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  // Heatmap (5 weeks x 7 days, by createdAt)
  const heat = Array.from({ length: 5 }, () => Array(7).fill(0));
  const today0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const d0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const daysAgo = Math.floor((today0 - d0) / 86400000);
    if (daysAgo >= 0 && daysAgo < 35) {
      const wk = 4 - Math.floor(daysAgo / 7);
      if (wk >= 0 && wk < 5) heat[wk][d.getUTCDay()]++;
    }
  });

  // AI brief metrics
  const inLastDays = (lo: number, hi: number) =>
    bookings.filter((b) => {
      const d0 = Date.UTC(new Date(b.createdAt).getUTCFullYear(), new Date(b.createdAt).getUTCMonth(), new Date(b.createdAt).getUTCDate());
      const daysAgo = Math.floor((today0 - d0) / 86400000);
      return daysAgo >= lo && daysAgo < hi;
    }).length;
  const thisWeek = inLastDays(0, 7);
  const lastWeek = inLastDays(7, 14);
  const growth = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;
  const busiest = byDay.reduce((a, b) => (b.bookings > a.bookings ? b : a), byDay[0] ?? { day: "—", bookings: 0 });
>>>>>>> origin/main

const STAT_CARDS: StatCard[] = [
  { id: "total-bookings", label: "Total Bookings", value: "1,248", hint: "All time", Icon: CalendarCheck2, accent: "bg-violet-100 text-violet-600" },
  { id: "monthly-bookings", label: "Monthly Bookings", value: "320", hint: "This month", Icon: CalendarDays, accent: "bg-blue-100 text-blue-600" },
  { id: "revenue", label: "Revenue", value: "$12,480", hint: "This month", Icon: DollarSign, accent: "bg-green-100 text-green-600" },
  { id: "popular-event", label: "Most Popular Event Type", value: "30 Min Intro Call", hint: "Top this week", Icon: Star, accent: "bg-amber-100 text-amber-600" },
];

const WEEKLY_BOOKINGS = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 18 },
  { day: "Wed", bookings: 15 },
  { day: "Thu", bookings: 22 },
  { day: "Fri", bookings: 14 },
  { day: "Sat", bookings: 4 },
  { day: "Sun", bookings: 2 },
];

const BOOKING_STATUS = [
  { name: "Confirmed", value: 642, color: "#16a34a" },
  { name: "Pending", value: 318, color: "#eab308" },
  { name: "Completed", value: 214, color: "#7c3aed" },
  { name: "Cancelled", value: 74, color: "#ef4444" },
];

const AI_REPORT = {
  badge: "Sample preview",
  summary:
    "Bookings climbed 12.5% week-over-week, led by your “30 Min Intro Call,” which made up roughly a third of all activity. Thursday was the busiest day, while weekends stayed quiet. Confirmed meetings dominate the pipeline and cancellations remain low at under 6%.",
  highlights: [
    "Thursday was the busiest booking day (22 bookings).",
    "Confirmed-to-cancelled ratio is healthy at ~8.7 : 1.",
    "Consider opening more weekend slots to capture overflow demand.",
  ],
};

// ─── SKELETONS (Tailwind only) ─────────────────────────
function StatCardsSkeleton() {
  return (
<<<<<<< HEAD
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="h-11 w-11 rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-4 h-7 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-3 w-28 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </section>
  );
}

function ChartSkeleton() {
  return <div className="h-[300px] w-full bg-gray-100 rounded-xl animate-pulse" />;
}

function AiReportSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-40 bg-violet-200/60 rounded animate-pulse" />
      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-11/12 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-9/12 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);

  // Static mock data — reveal immediately on mount (no artificial delay).
  useEffect(() => {
    setLoading(false);
  }, []);

  // Crash-proof: always arrays, never undefined.
  const statCards = Array.isArray(STAT_CARDS) ? STAT_CARDS : [];
  const barData = Array.isArray(WEEKLY_BOOKINGS) ? WEEKLY_BOOKINGS : [];
  const pieData = Array.isArray(BOOKING_STATUS) ? BOOKING_STATUS : [];
  const highlights = Array.isArray(AI_REPORT?.highlights) ? AI_REPORT.highlights : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* ─── Header ─────────────────────────────── */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">Analytics overview · sample data</p>
        </header>

        {/* ─── Stat cards (4) ─────────────────────── */}
        {loading ? (
          <StatCardsSkeleton />
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card?.Icon ?? Sparkles;
              return (
                <div
                  key={card?.id ?? card?.label}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-violet-200"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                      card?.accent ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-gray-900 leading-tight">
                    {card?.value ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{card?.label ?? "—"}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{card?.hint ?? ""}</p>
                </div>
              );
            })}
          </section>
        )}

        {/* ─── Charts (2) ─────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Weekly Bookings" subtitle="Bookings per day (last 7 days)">
            {loading ? <ChartSkeleton /> : <WeeklyBookingsBarChart data={barData} />}
          </ChartCard>

          <ChartCard title="Booking Status" subtitle="Distribution by status">
            {loading ? <ChartSkeleton /> : <BookingStatusPieChart data={pieData} />}
          </ChartCard>
        </section>

        {/* ─── AI Weekly Report (gradient border + animated badge) ─── */}
        <section className="rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-[1.5px] shadow-sm">
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-6">
            {loading ? (
              <AiReportSkeleton />
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <Sparkles className="w-4 h-4" />
                    <span className="absolute inset-0 rounded-xl bg-violet-500 opacity-30 animate-ping" />
                  </span>
                  <h2 className="font-semibold text-violet-800">AI Weekly Report</h2>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-violet-600">
                    {AI_REPORT?.badge ?? "Preview"}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-700">
                  {AI_REPORT?.summary ?? ""}
                </p>
                <ul className="mt-4 space-y-2">
                  {highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
=======
    <div className="min-h-screen bg-[#E8EDF4]">
      <DashboardNav user={user} />
      <AnalyticsClient
        kpis={{ total, active, revenue: Math.round(revenue), conversion }}
        trend={trend}
        byDay={byDay}
        byType={byType}
        heat={heat}
        brief={{ thisWeek, growth, busiestDay: busiest.day, topType: byType[0]?.name ?? null }}
      />
>>>>>>> origin/main
    </div>
  );
}

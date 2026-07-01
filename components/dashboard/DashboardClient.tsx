// components/dashboard/DashboardClient.tsx
// ChronoAI dashboard UI (client) — dark theme, 3-column with mini-calendar
// Owned by: Lead

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Users, TrendingUp, IndianRupee, ArrowRight,
  Sparkles, Clock, Zap, BarChart3,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { QuickCreateModal } from "./QuickCreateModal";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;
const MINI_TREND = [{ v: 9 }, { v: 14 }, { v: 11 }, { v: 18 }, { v: 22 }, { v: 28 }, { v: 30 }];

type Stat = { total: number; today: number; week: number; revenue: number };
type Upcoming = { name: string; time: string; duration: string; status: string; color: string };
type Schedule = { time: string; title: string; client: string; duration: string; color: string };

const STATUS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  confirmed: { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-500/15" },
  pending: { dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-500/15" },
  cancelled: { dot: "bg-red-400", text: "text-red-300", bg: "bg-red-500/15" },
  completed: { dot: "bg-violet-400", text: "text-violet-300", bg: "bg-violet-500/15" },
};

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function StatCard({ title, value, prefix = "", change, color, icon: Icon, delay = 0 }: {
  title: string; value: number; prefix?: string; change: string;
  color: string; icon: typeof Calendar; delay?: number;
}) {
  const animated = useCountUp(value);
  return (
    <div
      className="bg-[#131a2e] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
        </div>
        <span className="text-[12px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">{change}</span>
      </div>
      <p className="text-[28px] font-bold text-white leading-none mb-1" style={MONO}>
        {prefix}{animated.toLocaleString()}
      </p>
      <p className="text-[13px] text-white/45 font-medium">{title}</p>
      <div className="mt-3 -mb-1">
        <ResponsiveContainer width="100%" height={32}>
          <LineChart data={MINI_TREND}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const today = new Date();
  const isThisMonth =
    cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  const first = new Date(cursor.year, cursor.month, 1);
  const startDow = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = first.toLocaleString("en-US", { month: "long", year: "numeric" });

  const shift = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      const year = c.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  };

  return (
    <div className="bg-[#131a2e] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-white">{monthLabel}</p>
        <div className="flex gap-1">
          <button onClick={() => shift(-1)} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => shift(1)} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[10px] font-semibold text-white/35">{d}</span>
        ))}
        {cells.map((d, i) => {
          const isToday = isThisMonth && d === today.getDate();
          return (
            <div key={i} className="flex items-center justify-center">
              {d === null ? (
                <span className="w-7 h-7" />
              ) : (
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors ${isToday
                      ? "bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] text-white font-bold shadow-md shadow-[#6C63FF]/30"
                      : "text-white/65 hover:bg-white/10"
                    }`}
                >
                  {d}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardClient({ userName, stats, upcoming, schedule, bookingUrl }: {
  userName: string; stats: Stat; upcoming: Upcoming[]; schedule: Schedule[]; bookingUrl: string | null;
}) {
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = time.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
  const firstName = userName.split(" ")[0];

  const copyLink = () => {
    if (!bookingUrl) { router.push("/dashboard/settings"); return; }
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-white leading-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-white/45 text-[12px] mt-0.5" style={MONO}>
            {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {" · "}{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/25 hover:scale-[1.03] active:scale-95 transition-transform"
          >
            <Zap className="w-4 h-4" /> Quick Book
          </button>
        </div>
      </div>

      {/* Body: center + right calendar column */}
      <div className="flex gap-6 items-start">
        {/* Center */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Banner */}
          <div className="relative bg-gradient-to-br from-[#1e3a5f] via-[#234876] to-[#2b6cb0] rounded-2xl p-6 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-white/80 text-[12px]">AI-powered scheduling</span>
                </div>
                <h2 className="text-[22px] font-bold text-white leading-tight mb-1">
                  Welcome to ChronoAI
                </h2>
                <p className="text-white/70 text-[13px]">
                  {stats.total === 0
                    ? "Share your booking link to get your first booking."
                    : `You have ${stats.today} booking${stats.today === 1 ? "" : "s"} today and ${stats.week} this week.`}
                </p>
              </div>
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 px-4 py-2 bg-white/15 text-white text-[12px] font-semibold rounded-xl border border-white/20 hover:bg-white/25 transition-colors"
              >
                <BarChart3 className="w-4 h-4" /> Full Report
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Bookings" value={stats.total} change="all time" color="#6C63FF" icon={Calendar} delay={0} />
            <StatCard title="Today's Bookings" value={stats.today} change="today" color="#00D4FF" icon={Users} delay={80} />
            <StatCard title="This Week" value={stats.week} change="this week" color="#EC4899" icon={TrendingUp} delay={160} />
            <StatCard title="Revenue This Month" value={stats.revenue} change="this month" color="#F59E0B" icon={IndianRupee} prefix="₹" delay={240} />
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-[#131a2e] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-white">Upcoming Bookings</h3>
              <button onClick={() => router.push("/dashboard/bookings")} className="text-[12px] font-bold text-[#8b9dff] bg-[#6C63FF]/15 px-3 py-1 rounded-full hover:bg-[#6C63FF]/25 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-[13px] text-white/35 text-center py-10">No upcoming bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((b, i) => {
                  const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.confirmed;
                  const ini = b.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}99)` }}>
                        {ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/90 group-hover:text-white truncate transition-colors">{b.name}</p>
                        <p className="text-[11px] text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {b.time} · {b.duration}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — mini calendar + today */}
        <aside className="w-[250px] flex-shrink-0 hidden xl:block space-y-6">
          <MiniCalendar />

          <div className="bg-[#131a2e] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-white">Today</h3>
              <button onClick={() => router.push("/dashboard/availability")} className="text-[11px] font-bold text-[#8b9dff] hover:underline">
                Hours
              </button>
            </div>
            {schedule.length === 0 ? (
              <p className="text-[12px] text-white/35 text-center py-6">Nothing scheduled today.</p>
            ) : (
              <div className="space-y-2.5">
                {schedule.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border" style={{ borderColor: `${s.color}33`, backgroundColor: `${s.color}12` }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[12px] font-semibold text-white truncate">{s.title}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0 ml-2" style={{ backgroundColor: s.color }}>
                        {s.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/45">{s.client} · {s.duration}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

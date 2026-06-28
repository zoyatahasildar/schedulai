// components/dashboard/DashboardClient.tsx
// ChronoAI dashboard UI (client) — receives real data as props
// Owned by: Lead

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Users, TrendingUp, IndianRupee, Plus, ArrowRight,
  Sparkles, Clock, Zap, BookOpen, BarChart3, Link2, Settings, Check,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;
const MINI_TREND = [{ v: 9 }, { v: 14 }, { v: 11 }, { v: 18 }, { v: 22 }, { v: 28 }, { v: 30 }];

type Stat = { total: number; today: number; week: number; revenue: number };
type Upcoming = { name: string; time: string; duration: string; status: string; color: string };
type Schedule = { time: string; title: string; client: string; duration: string; color: string };

const STATUS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  confirmed: { dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
  pending: { dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50" },
  cancelled: { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50" },
  completed: { dot: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50" },
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
      className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
        </div>
        <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{change}</span>
      </div>
      <p className="text-[28px] font-bold text-gray-900 leading-none mb-1" style={MONO}>
        {prefix}{animated.toLocaleString()}
      </p>
      <p className="text-[13px] text-gray-500 font-medium">{title}</p>
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

export function DashboardClient({ userName, stats, upcoming, schedule, bookingUrl }: {
  userName: string; stats: Stat; upcoming: Upcoming[]; schedule: Schedule[]; bookingUrl: string | null;
}) {
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const [showInsight, setShowInsight] = useState(true);

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

  const QUICK_ACTIONS = [
    { icon: Plus, label: "New Event", color: "#6C63FF", bg: "#F0EFFF", onClick: () => router.push("/dashboard/event-types/new") },
    { icon: Link2, label: copied ? "Copied!" : "Copy Link", color: "#00D4FF", bg: "#E0F9FF", onClick: copyLink },
    { icon: BarChart3, label: "View Analytics", color: "#EC4899", bg: "#FDE8F4", onClick: () => router.push("/admin") },
    { icon: BookOpen, label: "Manage Bookings", color: "#F59E0B", bg: "#FFFBEB", onClick: () => router.push("/dashboard/bookings") },
    { icon: Clock, label: "Set Availability", color: "#10B981", bg: "#ECFDF5", onClick: () => router.push("/dashboard/availability") },
    { icon: Settings, label: "Settings", color: "#8B5CF6", bg: "#F3F0FF", onClick: () => router.push("/dashboard/settings") },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#6C63FF] via-[#7C6FFF] to-[#00D4FF] rounded-2xl p-8 mb-8 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-500">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#EC4899]/20 rounded-full blur-2xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/80 text-[13px]">AI-powered scheduling</span>
            </div>
            <h1 className="text-[32px] font-bold text-white leading-tight mb-1">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-white/70 text-[14px]">
              {stats.total === 0
                ? "Share your booking link to get your first booking."
                : `You have ${stats.today} booking${stats.today === 1 ? "" : "s"} today and ${stats.week} this week.`}
            </p>
            <p className="text-white/50 text-[12px] mt-1" style={MONO}>
              {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {" · "}{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/bookings")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#6C63FF] text-[13px] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4" /> Quick Book
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white text-[13px] font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
            >
              <BarChart3 className="w-4 h-4" /> Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Bookings" value={stats.total} change="all time" color="#6C63FF" icon={Calendar} delay={0} />
        <StatCard title="Today's Bookings" value={stats.today} change="today" color="#00D4FF" icon={Users} delay={80} />
        <StatCard title="This Week" value={stats.week} change="this week" color="#EC4899" icon={TrendingUp} delay={160} />
        <StatCard title="Revenue This Month" value={stats.revenue} change="this month" color="#F59E0B" icon={IndianRupee} prefix="₹" delay={240} />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-900">Upcoming Bookings</h2>
            <button onClick={() => router.push("/dashboard/bookings")} className="text-[12px] font-bold text-[#6C63FF] bg-[#F0EFFF] px-3 py-1 rounded-full hover:bg-[#E8E7FF] transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-10">No upcoming bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b, i) => {
                const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.confirmed;
                const ini = b.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}99)` }}>
                      {ini}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 group-hover:text-[#6C63FF] truncate transition-colors">{b.name}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
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

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-900">Today&apos;s Schedule</h2>
            <button onClick={() => router.push("/dashboard/availability")} className="text-[12px] font-bold text-[#EC4899] bg-[#FDE8F4] px-3 py-1 rounded-full hover:bg-[#FBCFE8] transition-colors flex items-center gap-1">
              Full view <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {schedule.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-10">Nothing scheduled today.</p>
          ) : (
            <div className="relative pl-4 space-y-4">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-100" />
              {schedule.map((s, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full ring-2 ring-white" style={{ backgroundColor: s.color }} />
                  <div className="p-3 rounded-xl border hover:shadow-md transition-all cursor-pointer" style={{ borderColor: `${s.color}30`, backgroundColor: `${s.color}08` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{s.title}</p>
                        <p className="text-[11px] text-gray-500">{s.client} · {s.duration}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: s.color }}>
                        {s.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
          <h2 className="text-[15px] font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border border-transparent hover:border-gray-100"
                style={{ backgroundColor: a.bg }}
              >
                {a.label === "Copied!" ? (
                  <Check className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                ) : (
                  <a.icon className="w-5 h-5" style={{ color: a.color }} strokeWidth={1.75} />
                )}
                <span className="text-[12px] font-semibold text-gray-700 text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      {showInsight && (
        <div className="bg-[#0D1117] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#6C63FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-24 w-56 h-56 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#6C63FF]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6C63FF] mb-1" style={MONO}>AI Insight</p>
              <p className="text-white text-[15px] font-semibold mb-2 leading-snug">
                {stats.total === 0
                  ? <>Set your availability and share your link to start receiving bookings.</>
                  : <>You have <span className="text-[#00D4FF]">{stats.week} bookings this week.</span> Keep your availability up to date to capture more.</>}
              </p>
              <p className="text-gray-400 text-[13px] leading-relaxed">
                Tip: the ChronoAI assistant (bottom-right) can answer guest questions and help them book 24/7.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/30 hover:scale-[1.02] transition-transform"
                >
                  <Zap className="w-4 h-4" /> View Analytics
                </button>
                <button onClick={() => setShowInsight(false)} className="px-4 py-2 text-gray-500 text-[13px] font-medium hover:text-gray-300 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

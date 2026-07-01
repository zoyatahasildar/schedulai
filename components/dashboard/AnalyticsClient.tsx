// components/dashboard/AnalyticsClient.tsx
// Analytics UI (client) — real charts from booking data
// Owned by: Member 5 / Lead
"use client";

import {
  Sparkles, Download, Share2, TrendingUp, Users, IndianRupee, Percent, ArrowUpRight, Check,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

type Trend = { month: string; count: number }[];
type ByDay = { day: string; bookings: number }[];
type ByType = { name: string; value: number; color: string }[];

const heatColor = (v: number) => {
  if (v === 0) return "#F1F5F9";
  if (v <= 1) return "#C4B5FD";
  if (v <= 3) return "#8B5CF6";
  if (v <= 5) return "#6C63FF";
  return "#4C1D95";
};

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#131a2e] border border-white/[0.06] rounded-xl p-3 shadow-xl">
      <p className="text-[11px] font-bold text-white/40 mb-1.5" style={MONO}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-[12px] text-white/50 capitalize">{p.dataKey}:</span>
          <span className="text-[12px] font-bold text-white" style={MONO}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsClient({ kpis, trend, byDay, byType, heat, brief }: {
  kpis: { total: number; active: number; revenue: number; conversion: number };
  trend: Trend;
  byDay: ByDay;
  byType: ByType;
  heat: number[][];
  brief: { thisWeek: number; growth: number; busiestDay: string; topType: string | null };
}) {
  const [shared, setShared] = useState(false);
  const spark = trend.map((t, j) => ({ val: t.count, idx: j }));
  const typeTotal = byType.reduce((a, b) => a + b.value, 0) || 1;

  const KPIS = [
    { title: "Total Bookings", value: String(kpis.total), color: "#6C63FF", icon: Users },
    { title: "Active Bookings", value: String(kpis.active), color: "#00D4FF", icon: TrendingUp },
    { title: "Revenue", value: `₹${kpis.revenue}`, color: "#EC4899", icon: IndianRupee },
    { title: "Conversion Rate", value: `${kpis.conversion}%`, color: "#F59E0B", icon: Percent },
  ];

  const exportCSV = () => {
    const lines = [
      "Section,Label,Value",
      ...trend.map((t) => `Monthly,${t.month},${t.count}`),
      ...byDay.map((d) => `ByDay,${d.day},${d.bookings}`),
      ...byType.map((t) => `ByType,${t.name},${t.value}`),
      `KPI,Total,${kpis.total}`,
      `KPI,Active,${kpis.active}`,
      `KPI,Revenue(INR),${kpis.revenue}`,
      `KPI,Conversion(%),${kpis.conversion}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analytics.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const shareSummary = () => {
    const text = `ChronoAI report: ${kpis.total} total bookings, ₹${kpis.revenue} revenue, ${kpis.conversion}% conversion. Busiest day: ${brief.busiestDay}.`;
    navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-white">Analytics</h1>
          <p className="text-[14px] text-white/50 mt-1">Data-driven insights into your scheduling performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={shareSummary} className="flex items-center gap-2 px-4 py-2.5 bg-[#00D4FF]/15 text-[#0099BB] text-[13px] font-bold rounded-xl hover:bg-[#00D4FF]/25 transition-colors shadow-sm">
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}{shared ? "Copied!" : "Share Report"}
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/20">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPIS.map((k, i) => (
          <div key={i} className="bg-[#131a2e] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${k.color}18` }}>
                <k.icon className="w-5 h-5" style={{ color: k.color }} strokeWidth={1.75} />
              </div>
              {brief.growth !== 0 && i === 0 && (
                <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />{brief.growth > 0 ? `+${brief.growth}%` : `${brief.growth}%`}
                </span>
              )}
            </div>
            <p className="text-[26px] font-bold text-white leading-none mb-1" style={MONO}>{k.value}</p>
            <p className="text-[12px] text-white/50 font-medium mb-3">{k.title}</p>
            <ResponsiveContainer width="100%" height={28}>
              <LineChart data={spark}>
                <Line type="monotone" dataKey="val" stroke={k.color} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
          <h3 className="text-[15px] font-bold text-white">Bookings Over Time</h3>
          <p className="text-[13px] text-white/50 mt-0.5 mb-5">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={3} dot={{ fill: "#6C63FF", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#6C63FF", stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
          <h3 className="text-[15px] font-bold text-white mb-1">Event Types</h3>
          <p className="text-[13px] text-white/50 mb-4">Booking share by type</p>
          {byType.length === 0 ? (
            <p className="text-[13px] text-white/40 text-center py-10">No bookings yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={byType} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {byType.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v} bookings`]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {byType.map((e) => {
                  const pct = Math.round((e.value / typeTotal) * 100);
                  return (
                    <div key={e.name}>
                      <div className="flex justify-between mb-1">
                        <span className="flex items-center gap-2 text-[12px] text-white/65"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />{e.name}</span>
                        <span className="text-[12px] font-bold text-white" style={MONO}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: e.color }} /></div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bar + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
          <h3 className="text-[15px] font-bold text-white mb-1">Bookings by Day</h3>
          <p className="text-[13px] text-white/50 mb-4">Which weekday drives the most bookings</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDay} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="bookings" radius={[6, 6, 0, 0]} fill="#6C63FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
          <h3 className="text-[15px] font-bold text-white mb-1">Activity Heatmap</h3>
          <p className="text-[13px] text-white/50 mb-5">Bookings made, last 5 weeks</p>
          <div className="space-y-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, di) => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-7 font-bold text-right" style={MONO}>{day}</span>
                <div className="flex gap-1.5 flex-1">
                  {heat.map((week, wi) => (
                    <div key={wi} className="flex-1 h-7 rounded-md transition-all hover:scale-110 cursor-pointer" style={{ backgroundColor: heatColor(week[di]) }} title={`${week[di]} bookings`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[11px] text-white/40">Less</span>
            {[0, 1, 3, 5, 7].map((v) => <div key={v} className="w-5 h-5 rounded-md" style={{ backgroundColor: heatColor(v) }} />)}
            <span className="text-[11px] text-white/40">More</span>
          </div>
        </div>
      </div>

      {/* AI Brief — computed from real data */}
      <div className="bg-[#0D1117] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#6C63FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#6C63FF]/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#6C63FF] mb-1" style={MONO}>AI Weekly Brief</p>
            <p className="text-white text-[15px] font-semibold mb-3 leading-snug">
              {kpis.total === 0
                ? "No bookings yet — share your booking link to start collecting data."
                : <>You had <span className="text-[#00D4FF]">{brief.thisWeek} booking{brief.thisWeek === 1 ? "" : "s"} this week</span>{brief.growth !== 0 ? <> ({brief.growth > 0 ? "+" : ""}{brief.growth}% vs last week)</> : null}.</>}
            </p>
            {kpis.total > 0 && (
              <ul className="space-y-1.5 text-[13px] text-gray-300 mb-4">
                <li>• Your busiest weekday is <span className="text-white font-semibold">{brief.busiestDay}</span>.</li>
                {brief.topType && <li>• Most-booked event type: <span className="text-[#00D4FF] font-semibold">{brief.topType}</span>.</li>}
                <li>• Total revenue so far: <span className="text-white font-semibold">₹{kpis.revenue}</span> at a {kpis.conversion}% confirm rate.</li>
              </ul>
            )}
            <div className="flex gap-3">
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/30">
                <Download className="w-4 h-4" /> Export Report
              </button>
              <button onClick={shareSummary} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 text-[13px] font-medium rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                <Share2 className="w-4 h-4" /> Copy Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/dashboard/AvailabilityClient.tsx
// Weekly availability editor (client) — saves to /api/availability
// Owned by: Lead / Member 3
"use client";

import React, { useState, useEffect } from "react";
import { Sunrise, Sun, Zap, Moon, Coffee, Save, Loader2, Check } from "lucide-react";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

// Display order Mon..Sun with matching DB dayOfWeek (0=Sun..6=Sat)
const DAYS = [
  { label: "Mon", dow: 1 }, { label: "Tue", dow: 2 }, { label: "Wed", dow: 3 },
  { label: "Thu", dow: 4 }, { label: "Fri", dow: 5 }, { label: "Sat", dow: 6 }, { label: "Sun", dow: 0 },
];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM – 8 PM (slots 8:00..20:00)

const PRESETS = [
  { icon: Sunrise, label: "Morning Person", desc: "9 AM – 1 PM", color: "#F59E0B", from: 9, to: 13, weekdaysOnly: true },
  { icon: Sun, label: "9-to-5", desc: "9 AM – 5 PM", color: "#6C63FF", from: 9, to: 17, weekdaysOnly: true },
  { icon: Zap, label: "Power Hours", desc: "10 AM – 3 PM", color: "#EC4899", from: 10, to: 15, weekdaysOnly: true },
  { icon: Moon, label: "Afternoons", desc: "2 PM – 8 PM", color: "#8B5CF6", from: 14, to: 20, weekdaysOnly: true },
  { icon: Coffee, label: "Coffee Chats", desc: "10 AM – 12 PM", color: "#10B981", from: 10, to: 12, weekdaysOnly: true },
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function hourLabel(h: number) { return h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`; }

type Grid = boolean[][]; // [dayIdx][hourIdx]

function emptyGrid(): Grid {
  return DAYS.map(() => HOURS.map(() => false));
}

function gridFromWindows(windows: { dayOfWeek: number; startTime: string; endTime: string }[]): Grid {
  const g = emptyGrid();
  windows.forEach((w) => {
    const dayIdx = DAYS.findIndex((d) => d.dow === w.dayOfWeek);
    if (dayIdx < 0) return;
    const sh = parseInt(w.startTime.split(":")[0], 10);
    const eh = parseInt(w.endTime.split(":")[0], 10);
    for (let h = sh; h < eh; h++) {
      const hi = HOURS.indexOf(h);
      if (hi >= 0) g[dayIdx][hi] = true;
    }
  });
  return g;
}

// Build Availability rows (one per contiguous run of available hours)
function windowsFromGrid(grid: Grid) {
  const rows: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[] = [];
  grid.forEach((day, di) => {
    let runStart: number | null = null;
    for (let hi = 0; hi <= HOURS.length; hi++) {
      const on = hi < HOURS.length && day[hi];
      if (on && runStart === null) runStart = HOURS[hi];
      if (!on && runStart !== null) {
        const endHour = HOURS[hi - 1] + 1;
        rows.push({ dayOfWeek: DAYS[di].dow, startTime: `${pad(runStart)}:00`, endTime: `${pad(endHour)}:00`, isActive: true });
        runStart = null;
      }
    }
  });
  return rows;
}

export function AvailabilityClient({ initial }: { initial: { dayOfWeek: number; startTime: string; endTime: string }[] }) {
  const [grid, setGrid] = useState<Grid>(() => gridFromWindows(initial));

  // After mount: if today has no slots saved, add 9 AM–5 PM so today is always visible
  useEffect(() => {
    const todayDow = new Date().getDay();
    const todayIdx = DAYS.findIndex((d) => d.dow === todayDow);
    if (todayIdx >= 0) {
      setGrid((prev) => {
        if (prev[todayIdx].some(Boolean)) return prev; // already has slots — leave as is
        return prev.map((day, i) =>
          i === todayIdx ? HOURS.map((h) => h >= 9 && h < 17) : day
        );
      });
    }
  }, []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ── Calendar state ──────────────────────────────────────────────────────────
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const CAL_MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const CAL_DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const prevCalMonth = () => setCalMonth(m => { if (m === 0) { setCalYear(y => y - 1); return 11; } return m - 1; });
  const nextCalMonth = () => setCalMonth(m => { if (m === 11) { setCalYear(y => y + 1); return 0; } return m + 1; });
  const dowAvailable = (dow: number) => { const idx = DAYS.findIndex(d => d.dow === dow); return idx >= 0 && grid[idx].some(Boolean); };

  const toggle = (di: number, hi: number) => {
    setGrid((prev) => prev.map((day, i) => (i === di ? day.map((v, j) => (j === hi ? !v : v)) : day)));
    setSaved(false);
  };

  const applyPreset = (from: number, to: number) => {
    setGrid(() =>
      DAYS.map((d) =>
        HOURS.map((h) => (d.dow >= 1 && d.dow <= 5 ? h >= from && h < to : false))
      )
    );
    setSaved(false);
  };

  const clearAll = () => { setGrid(emptyGrid()); setSaved(false); };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const availability = windowsFromGrid(grid);
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const availableHours = grid.flat().filter(Boolean).length;
  const daysEnabled = grid.filter((d) => d.some(Boolean)).length;

  // Per-day summary
  const summary = DAYS.map((d, di) => {
    const hrs = HOURS.filter((_, hi) => grid[di][hi]);
    if (hrs.length === 0) return { label: d.label, text: "Off" };
    return { label: d.label, text: `${hourLabel(hrs[0])} – ${hourLabel(hrs[hrs.length - 1] + 1)}` };
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Availability</h1>
          <p className="text-[14px] text-gray-500 mt-1">Click the slots you&apos;re free, then save. Guests can only book inside these hours (UTC).</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearAll} className="px-4 py-2.5 bg-gray-100 text-gray-600 text-[13px] font-semibold rounded-xl hover:bg-gray-200 transition-colors">Clear</button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/25 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Schedule"}
          </button>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-500 mb-4">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available Slots", value: availableHours, color: "#6C63FF", bg: "#F0EFFF" },
          { label: "Days Enabled", value: daysEnabled, color: "#10B981", bg: "#ECFDF5" },
          { label: "Hours / Week", value: availableHours, color: "#EC4899", bg: "#FDE8F4" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: s.bg }} />
            <div>
              <p className="text-[22px] font-bold leading-none" style={{ ...MONO, color: s.color }}>{s.value}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Small Calendar – left corner */}
      <div className="mb-4">
        <div className="inline-block bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-4 w-56">
          <div className="flex items-center justify-between mb-1">
            <button onClick={prevCalMonth} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 transition-colors text-sm">&#8249;</button>
            <div className="text-center">
              <span className="text-[12px] font-bold text-gray-800">{CAL_MONTH_NAMES[calMonth]} {calYear}</span>
              {(calYear !== new Date().getFullYear() || calMonth !== new Date().getMonth()) && (
                <button onClick={() => { setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth()); }}
                  className="block text-[9px] text-[#6C63FF] hover:underline mx-auto leading-tight">
                  Go to today
                </button>
              )}
            </div>
            <button onClick={nextCalMonth} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 transition-colors text-sm">&#8250;</button>
          </div>
          <div className="mb-1" />
          <div className="grid grid-cols-7 mb-1">
            {CAL_DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[8px] font-bold text-gray-400 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {(() => {
              const firstDay = new Date(calYear, calMonth, 1).getDay();
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const today = new Date();
              const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
              const cells: React.ReactNode[] = [];
              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`e${i}`} />);
              }
              for (let d = 1; d <= daysInMonth; d++) {
                const isToday = isCurrentMonth && today.getDate() === d;
                cells.push(
                  <div key={d} className="flex items-center justify-center">
                    <span className={`text-[9px] w-4 h-4 flex items-center justify-center rounded-full
                      ${isToday ? "bg-[#6C63FF] text-white font-bold" : "text-gray-500"}`}>
                      {d}
                    </span>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF] inline-block" />Today</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Grid */}
        <div className="xl:col-span-3 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold"><span className="w-3 h-3 rounded bg-[#6C63FF]/20 border border-[#6C63FF]/30 inline-block" />Available</span>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold"><span className="w-3 h-3 rounded bg-gray-100 inline-block" />Unavailable</span>
            <span className="ml-auto text-[12px] text-gray-400">Click a slot to toggle</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className="w-16 py-3 px-3 text-left"><span className="text-[11px] font-bold text-gray-400 uppercase" style={MONO}>Time</span></th>
                  {DAYS.map((d) => (
                    <th key={d.label} className="py-3 px-1 text-center"><p className="text-[11px] font-bold text-gray-400 uppercase" style={MONO}>{d.label}</p></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour, hi) => (
                  <tr key={hour} className="border-t border-gray-50">
                    <td className="py-1.5 px-3 text-[11px] text-gray-400 font-medium whitespace-nowrap" style={MONO}>{hourLabel(hour)}</td>
                    {DAYS.map((d, di) => {
                      const on = grid[di][hi];
                      return (
                        <td key={d.label} className="py-1 px-1">
                          <button onClick={() => toggle(di, hi)}
                            className={`w-full h-8 rounded-lg transition-all duration-150 ${on ? "bg-[#6C63FF]/20 hover:bg-[#6C63FF]/35 border border-[#6C63FF]/30" : "bg-gray-100 hover:bg-gray-200 border border-transparent"}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
            <h3 className="text-[14px] font-bold text-gray-900 mb-4">Quick Presets</h3>
            <div className="space-y-2">
              {PRESETS.map(({ icon: Icon, label, desc, color, from, to }) => (
                <button key={label} onClick={() => applyPreset(from, to)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-400">{desc} · Mon–Fri</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Presets fill the grid — review and hit Save.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Weekly Summary</h3>
            <div className="space-y-2">
              {summary.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-gray-600">{s.label}</p>
                  <span className={`text-[12px] font-bold px-2.5 py-1 rounded-lg ${s.text === "Off" ? "bg-gray-100 text-gray-400" : "bg-[#F0EFFF] text-[#6C63FF]"}`} style={MONO}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

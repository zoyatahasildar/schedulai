// components/charts/WeeklyBookingsBarChart.tsx
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Bar chart for weekly bookings — cleaner padding, polished tooltip,
// empty-state UI. Recharts requires a client component.

"use client";

import type { CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Inbox } from "lucide-react";

export interface WeeklyBookingPoint {
  day: string;
  bookings: number;
}

interface WeeklyBookingsBarChartProps {
  data: WeeklyBookingPoint[];
  height?: number;
}

const TOOLTIP_STYLE: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #ede9fe",
  boxShadow: "0 8px 24px rgba(76, 29, 149, 0.12)",
  padding: "8px 12px",
  fontSize: 12,
};

function ChartEmptyState({ height = 300 }: { height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ height }}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Inbox className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500">No bookings yet</p>
      <p className="text-xs text-gray-400 mt-1">
        Your data will appear here once bookings start coming in.
      </p>
    </div>
  );
}

export function WeeklyBookingsBarChart({ data = [], height = 300 }: WeeklyBookingsBarChartProps) {
  const rows = data ?? [];
  const isEmpty = rows.length === 0 || rows.every((r) => !r || !r.bookings);

  if (isEmpty) return <ChartEmptyState height={height} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 12, right: 12, left: -8, bottom: 4 }} barCategoryGap="28%">
        <defs>
          <linearGradient id="barViolet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} dy={6} />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke="#94a3b8"
          fontSize={12}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "rgba(124, 58, 237, 0.06)" }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "#6d28d9", fontWeight: 600, marginBottom: 2 }}
          itemStyle={{ color: "#4b5563" }}
        />
        <Bar dataKey="bookings" fill="url(#barViolet)" radius={[8, 8, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default WeeklyBookingsBarChart;

// components/charts/WeeklyBookingsBarChart.tsx
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Simple, stable bar chart for weekly bookings.
// Recharts requires a client component.

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface WeeklyBookingPoint {
  day: string;
  bookings: number;
}

interface WeeklyBookingsBarChartProps {
  data: WeeklyBookingPoint[];
  height?: number;
}

export function WeeklyBookingsBarChart({ data = [], height = 300 }: WeeklyBookingsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} />
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
          contentStyle={{ borderRadius: 12, border: "1px solid #ede9fe", fontSize: 12 }}
        />
        <Bar dataKey="bookings" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default WeeklyBookingsBarChart;

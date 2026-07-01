// components/charts/BookingStatusPieChart.tsx
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Donut chart for booking-status breakdown — polished tooltip,
// empty-state UI. Recharts requires a client component.

"use client";

import type { CSSProperties } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Inbox } from "lucide-react";

export interface BookingStatusSlice {
  name: string;
  value: number;
  color: string;
}

interface BookingStatusPieChartProps {
  data: BookingStatusSlice[];
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
        Status breakdown appears here once you have bookings.
      </p>
    </div>
  );
}

export function BookingStatusPieChart({ data = [], height = 300 }: BookingStatusPieChartProps) {
  const slices = data ?? [];
  const isEmpty = slices.length === 0 || slices.every((s) => !s || !s.value);

  if (isEmpty) return <ChartEmptyState height={height} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={64}
          outerRadius={102}
          paddingAngle={3}
          stroke="#ffffff"
          strokeWidth={2}
        >
          {slices.map((slice, i) => (
            <Cell key={slice?.name ?? i} fill={slice?.color ?? "#9ca3af"} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#4b5563" }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default BookingStatusPieChart;

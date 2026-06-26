// components/charts/BookingStatusPieChart.tsx
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Simple, stable donut chart for booking-status breakdown.
// Recharts requires a client component.

"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface BookingStatusSlice {
  name: string;
  value: number;
  color: string;
}

interface BookingStatusPieChartProps {
  data: BookingStatusSlice[];
  height?: number;
}

export function BookingStatusPieChart({ data = [], height = 300 }: BookingStatusPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ede9fe", fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default BookingStatusPieChart;

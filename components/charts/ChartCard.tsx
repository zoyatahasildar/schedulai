// components/charts/ChartCard.tsx
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Reusable card wrapper for dashboard charts.
// Self-contained (plain Tailwind) so it works in any context.

import * as React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, className, children }: ChartCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className ?? ""}`}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default ChartCard;

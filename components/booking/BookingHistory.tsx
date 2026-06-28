// components/booking/BookingHistory.tsx
// Presentational booking history timeline (server-friendly)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

import { PlusCircle, CalendarClock, XCircle, CheckCircle2, Ban, History } from "lucide-react";

type Action = "CREATED" | "RESCHEDULED" | "CANCELLED" | "ACCEPTED" | "REJECTED";

export interface BookingHistoryItem {
  id: string;
  action: Action;
  previousStartTime: Date | string | null;
  previousEndTime: Date | string | null;
  newStartTime: Date | string | null;
  newEndTime: Date | string | null;
  reason: string | null;
  createdAt: Date | string;
}

function fmt(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

const META: Record<Action, { label: string; icon: typeof PlusCircle; color: string }> = {
  CREATED: { label: "Request created", icon: PlusCircle, color: "text-gray-500" },
  RESCHEDULED: { label: "Rescheduled", icon: CalendarClock, color: "text-violet-600" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-600" },
  ACCEPTED: { label: "Accepted by host", icon: CheckCircle2, color: "text-green-600" },
  REJECTED: { label: "Rejected by host", icon: Ban, color: "text-red-600" },
};

export function BookingHistory({ history }: { history: BookingHistoryItem[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-6 text-left">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">Booking history</h2>
      </div>

      <ol className="space-y-3">
        {history.map((item) => {
          const meta = META[item.action];
          const Icon = meta.icon;
          return (
            <li key={item.id} className="flex gap-3">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.color}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                {item.action === "RESCHEDULED" && (
                  <p className="text-xs text-gray-500">
                    {fmt(item.previousStartTime)} UTC → {fmt(item.newStartTime)} UTC
                  </p>
                )}
                {item.action === "CREATED" && item.newStartTime && (
                  <p className="text-xs text-gray-500">for {fmt(item.newStartTime)} UTC</p>
                )}
                {(item.action === "CANCELLED" ||
                  item.action === "REJECTED" ||
                  item.action === "ACCEPTED") &&
                  item.reason && (
                    <p className="text-xs text-gray-500">{item.reason}</p>
                  )}
                <p className="text-[11px] text-gray-400 mt-0.5">{fmt(item.createdAt)} UTC</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

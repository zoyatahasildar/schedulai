// components/calendar/CalendarView.tsx
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Monthly calendar view — shows available days based on weekly schedule

"use client";

import { useState } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CalendarViewProps {
  // Array of active day indexes (0=Sun ... 6=Sat) from AvailabilityPicker
  activeDays: number[];
}

export default function CalendarView({ activeDays }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected]   = useState<string | null>(null);

  // First day of the month and total days
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays  = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const dayOfWeek = (day: number) =>
    new Date(viewYear, viewMonth, day).getDay();

  const isAvailable = (day: number) =>
    !isPast(day) && activeDays.includes(dayOfWeek(day));

  const dateKey = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Build grid cells (leading blanks + day numbers)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
        <button
          onClick={prevMonth}
          className="text-white hover:bg-blue-700 rounded-lg p-1.5 transition-colors"
          aria-label="Previous month"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-white font-semibold text-base">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>

        <button
          onClick={nextMonth}
          className="text-white hover:bg-blue-700 rounded-lg p-1.5 transition-colors"
          aria-label="Next month"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Day labels ── */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`blank-${idx}`} className="bg-white h-10" />;
          }

          const available = isAvailable(day);
          const past      = isPast(day);
          const today_    = isToday(day);
          const key       = dateKey(day);
          const isSelected = selected === key;

          return (
            <button
              key={key}
              onClick={() => available && setSelected(isSelected ? null : key)}
              disabled={!available}
              className={`
                bg-white h-10 flex items-center justify-center text-sm font-medium transition-colors
                ${today_ ? "ring-2 ring-inset ring-blue-400" : ""}
                ${isSelected
                  ? "bg-blue-600 text-white"
                  : available
                    ? "text-gray-900 hover:bg-blue-50 cursor-pointer"
                    : past
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-300 cursor-not-allowed"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-white border border-gray-300" />
          Unavailable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-50 border border-blue-200" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
          Selected
        </span>
      </div>

      {/* ── Selected date info ── */}
      {selected && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100 text-sm text-blue-700 font-medium">
          📅 Selected: {selected}
        </div>
      )}
    </div>
  );
}

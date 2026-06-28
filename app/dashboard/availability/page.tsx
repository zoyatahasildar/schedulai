// app/dashboard/availability/page.tsx
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)

"use client";

import { useState } from "react";
import AvailabilityPicker from "@/components/calendar/AvailabilityPicker";
import CalendarView from "@/components/calendar/CalendarView";

export default function AvailabilityPage() {
  // Track which days are active so the calendar can highlight them
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon–Fri default

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set your weekly schedule and see your available days on the calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Calendar view ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Calendar Preview
          </h2>
          <CalendarView activeDays={activeDays} />
        </div>

        {/* ── Right: Weekly schedule picker ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Weekly Schedule
          </h2>
          <AvailabilityPicker onActiveDaysChange={setActiveDays} />
        </div>
      </div>
    </div>
  );
}

// components/calendar/AvailabilityPicker.tsx
// Weekly availability picker — used on the dashboard settings page
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)
// Branch: feat/calendar-slots
// ═══════════════════════════════════════════════
//
// Usage (in dashboard settings):
//   import AvailabilityPicker from "@/components/calendar/AvailabilityPicker";
//   <AvailabilityPicker />

"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DaySchedule {
  dayOfWeek: number;   // 0 = Sunday … 6 = Saturday
  isActive:  boolean;
  startTime: string;   // "HH:MM" UTC
  endTime:   string;   // "HH:MM" UTC
}

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_SCHEDULE: DaySchedule[] = DAY_LABELS.map((_, i) => ({
  dayOfWeek: i,
  isActive:  i >= 1 && i <= 5, // Mon–Fri on by default
  startTime: "09:00",
  endTime:   "17:00",
}));

// ── Time options (every 30 min) ───────────────────────────────────────────────

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AvailabilityPicker() {
  const [schedule, setSchedule]   = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [loading,  setLoading]    = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [saved,    setSaved]      = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  // ── Load existing availability on mount ──────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        // We need the current user's ID — fetch it from the session endpoint
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const userId = sessionData?.user?.id;
        if (!userId) return; // Not logged in — leave defaults

        const res = await fetch(`/api/availability?userId=${userId}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Merge saved rows into the default 7-day structure
          const merged = DEFAULT_SCHEDULE.map((def) => {
            const saved = json.data.find(
              (a: DaySchedule) => a.dayOfWeek === def.dayOfWeek
            );
            return saved
              ? { ...def, isActive: saved.isActive, startTime: saved.startTime, endTime: saved.endTime }
              : def;
          });
          setSchedule(merged);
        }
      } catch (err) {
        // Non-fatal — user can still set availability manually
        console.warn("[AvailabilityPicker] Could not load saved availability:", err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleDay = useCallback((dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayIndex ? { ...d, isActive: !d.isActive } : d
      )
    );
    setSaved(false);
    setError(null);
  }, []);

  const updateTime = useCallback(
    (dayIndex: number, field: "startTime" | "endTime", value: string) => {
      setSchedule((prev) =>
        prev.map((d) =>
          d.dayOfWeek === dayIndex ? { ...d, [field]: value } : d
        )
      );
      setSaved(false);
      setError(null);
    },
    []
  );

  const validate = (): string | null => {
    for (const day of schedule) {
      if (!day.isActive) continue;
      if (day.startTime >= day.endTime) {
        return `${DAY_LABELS[day.dayOfWeek]}: start time must be before end time`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/availability", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ availability: schedule }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to save");
      }

      setSaved(true);
      // Auto-hide the success banner after 3 s
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-sm text-gray-500">Loading your availability…</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* ── Header ── */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Availability</h2>
        <p className="text-sm text-gray-500">
          Set the hours you are available for bookings. All times are in UTC.
        </p>
      </div>

      {/* ── Day rows ── */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
        {schedule.map((day) => (
          <DayRow
            key={day.dayOfWeek}
            day={day}
            label={DAY_LABELS[day.dayOfWeek]}
            onToggle={() => toggleDay(day.dayOfWeek)}
            onChangeStart={(v) => updateTime(day.dayOfWeek, "startTime", v)}
            onChangeEnd={(v)   => updateTime(day.dayOfWeek, "endTime",   v)}
          />
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* ── Success banner ── */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          Availability saved successfully!
        </div>
      )}

      {/* ── Save button ── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving…
            </>
          ) : (
            "Save Availability"
          )}
        </button>
      </div>
    </div>
  );
}

// ── DayRow sub-component ──────────────────────────────────────────────────────

interface DayRowProps {
  day:           DaySchedule;
  label:         string;
  onToggle:      () => void;
  onChangeStart: (v: string) => void;
  onChangeEnd:   (v: string) => void;
}

function DayRow({ day, label, onToggle, onChangeStart, onChangeEnd }: DayRowProps) {
  return (
    <div
      className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 ${
        day.isActive ? "" : "opacity-50"
      }`}
    >
      {/* Toggle + label */}
      <div className="flex items-center gap-3 sm:w-36">
        {/* Custom toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={day.isActive}
          onClick={onToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            day.isActive ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
              day.isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>

      {/* Time selectors */}
      {day.isActive ? (
        <div className="flex items-center gap-2">
          <TimeSelect
            value={day.startTime}
            onChange={onChangeStart}
            label={`${label} start time`}
          />
          <span className="text-sm text-gray-400">to</span>
          <TimeSelect
            value={day.endTime}
            onChange={onChangeEnd}
            label={`${label} end time`}
            min={day.startTime}
          />
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Unavailable</span>
      )}
    </div>
  );
}

// ── TimeSelect sub-component ──────────────────────────────────────────────────

interface TimeSelectProps {
  value:    string;
  onChange: (v: string) => void;
  label:    string;
  min?:     string;
}

function TimeSelect({ value, onChange, label, min }: TimeSelectProps) {
  const options = min
    ? TIME_OPTIONS.filter((t) => t > min)
    : TIME_OPTIONS;

  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

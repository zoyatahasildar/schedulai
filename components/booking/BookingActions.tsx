// components/booking/BookingActions.tsx
// Guest-facing Reschedule + Cancel controls for a confirmed booking (client)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════
// Navigation note (requirement #5): every action here stays in the SAME tab —
// it uses fetch() + router.refresh() and plain buttons, never target="_blank"
// or window.open(), so the guest never loses their place.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarClock, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface BookingActionsProps {
  bookingId: string;
  eventTypeId: string;
  duration: number;
}

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

function buildDays(count: number): { value: string; weekday: string; day: string }[] {
  const days: { value: string; weekday: string; day: string }[] = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + i));
    days.push({
      value: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    });
  }
  return days;
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export function BookingActions({ bookingId, eventTypeId, duration }: BookingActionsProps) {
  const router = useRouter();
  const days = buildDays(14);

  const [mode, setMode] = useState<"idle" | "reschedule" | "cancel">("idle");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  // Reschedule slot state
  const [selectedDate, setSelectedDate] = useState(days[0].value);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const loadSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(`/api/booking/slots?eventTypeId=${eventTypeId}&date=${date}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to load slots");
        setSlots(json.data.slots ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load slots");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [eventTypeId]
  );

  useEffect(() => {
    if (mode === "reschedule") loadSlots(selectedDate);
  }, [mode, selectedDate, loadSlots]);

  const confirmReschedule = async () => {
    if (!selectedSlot) {
      setError("Please pick a new time.");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: selectedSlot.startTime }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to reschedule");
      setMode("idle");
      router.refresh(); // same tab — re-render the server page with new time + history
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reschedule");
      setWorking(false);
    }
  };

  const confirmCancel = async () => {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to cancel");
      setMode("idle");
      router.refresh(); // same tab — re-render the server page as CANCELLED
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
      setWorking(false);
    }
  };

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="mt-6">
      {/* Primary actions */}
      {mode === "idle" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => { setError(null); setMode("reschedule"); }}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            <CalendarClock className="w-4 h-4 mr-2" />
            Reschedule Booking
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => { setError(null); setMode("cancel"); }}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Booking
          </Button>
        </div>
      )}

      {/* Cancel confirmation */}
      {mode === "cancel" && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-left">
          <p className="text-sm font-medium text-red-700 mb-3">
            Cancel this booking? This keeps the record but marks it cancelled.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={confirmCancel}
              disabled={working}
              className="bg-red-600 hover:bg-red-700"
            >
              {working && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {working ? "Cancelling…" : "Yes, cancel"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode("idle")}
              disabled={working}
            >
              Keep booking
            </Button>
          </div>
        </div>
      )}

      {/* Reschedule picker */}
      {mode === "reschedule" && (
        <div className="border border-violet-200 bg-violet-50/40 rounded-xl p-4 text-left">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-violet-700">Pick a new time</p>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
          </div>

          {/* Date strip */}
          <Label className="flex items-center gap-1.5 mb-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Date
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {days.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSelectedDate(d.value)}
                className={`flex-shrink-0 w-14 py-2 rounded-lg border text-center transition-colors ${
                  selectedDate === d.value
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-violet-300"
                }`}
              >
                <span className="block text-[10px]">{d.weekday}</span>
                <span className="block text-xs font-semibold">{d.day}</span>
              </button>
            ))}
          </div>

          {/* Slots */}
          <Label className="mb-2 block text-xs">Available times (UTC)</Label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-gray-400 py-6 justify-center text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-sm">
              No available times on this date. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSlot?.startTime === slot.startTime
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-violet-400"
                  }`}
                >
                  {formatSlotTime(slot.startTime)}
                </button>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={confirmReschedule}
            disabled={working || !selectedSlot}
            className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
          >
            {working && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {working ? "Updating…" : "Confirm new time"}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
          {error}
        </p>
      )}
    </div>
  );
}

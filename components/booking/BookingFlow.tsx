// components/booking/BookingFlow.tsx
// Interactive public booking flow (client component)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════
// All times are handled in UTC (team rule #1). Slot labels are shown in UTC
// so guest and host agree on a single canonical time.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AISuggestions } from "@/components/booking/AISuggestions";

interface BookingFlowProps {
  eventTypeId: string;
  duration: number;
  hostName: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Build the next N calendar days as UTC date strings (YYYY-MM-DD)
function buildDays(count: number): { value: string; weekday: string; day: string }[] {
  const days: { value: string; weekday: string; day: string }[] = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + i));
    const value = d.toISOString().slice(0, 10);
    days.push({
      value,
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

export function BookingFlow({ eventTypeId, duration, hostName }: BookingFlowProps) {
  const router = useRouter();
  const days = buildDays(14);

  const [selectedDate, setSelectedDate] = useState(days[0].value);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setError(null);
      try {
        const res = await fetch(
          `/api/booking/slots?eventTypeId=${eventTypeId}&date=${date}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load slots");
        }
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
    loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    if (!guestName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(guestEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || undefined,
          notes: notes.trim() || undefined,
          startTime: selectedSlot.startTime,
          eventTypeId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create booking");
      }
      router.push(`/booking/success?bookingId=${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      setSubmitting(false);
    }
  };

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="p-6 space-y-8">
      {/* AI suggestions */}
      <AISuggestions eventTypeId={eventTypeId} />

      {/* Date selector */}
      <div>
        <Label className="flex items-center gap-1.5 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          Select a date
        </Label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setSelectedDate(d.value)}
              className={`flex-shrink-0 w-16 py-2 rounded-xl border text-center transition-colors ${
                selectedDate === d.value
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "border-gray-200 text-gray-600 hover:border-violet-300"
              }`}
            >
              <span className="block text-xs">{d.weekday}</span>
              <span className="block text-sm font-semibold">{d.day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot grid */}
      <div>
        <Label className="mb-3 block">Available times (UTC)</Label>
        {loadingSlots ? (
          <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading slots…
          </div>
        ) : availableSlots.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">
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
                    : "border-gray-200 text-gray-700 hover:border-violet-400"
                }`}
              >
                {formatSlotTime(slot.startTime)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Guest details form */}
      <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-6">
        <div className="space-y-2">
          <Label htmlFor="guestName">Your name</Label>
          <Input
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guestEmail">Email</Label>
          <Input
            id="guestEmail"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guestPhone">Phone (optional)</Label>
          <Input
            id="guestPhone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={`Anything ${hostName} should know before the meeting?`}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {selectedSlot && (
          <p className="text-sm text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
            Booking {formatSlotTime(selectedSlot.startTime)} UTC on {selectedDate} ·{" "}
            {duration} min
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting || !selectedSlot}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitting ? "Confirming…" : "Confirm booking"}
        </Button>
      </form>
    </div>
  );
}

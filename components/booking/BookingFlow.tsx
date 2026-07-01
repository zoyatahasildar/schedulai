// components/booking/BookingFlow.tsx
// Interactive public booking flow (client component)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
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

function formatSlotTime(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });
}

export function BookingFlow({ eventTypeId, duration, hostName }: BookingFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const username = (params?.username as string) || "";

  const days = buildDays(14);

  const [selectedDate, setSelectedDate] = useState(days[0].value);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Form states
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [additionalGuests, setAdditionalGuests] = useState<string[]>([]);
  const [newGuestEmail, setNewGuestEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Timezone detection
  const [timezone, setTimezone] = useState("UTC");
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);

  useEffect(() => {
    // Detect local timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setTimezone(tz);
      }
    } catch (e) {
      console.warn("Failed to detect timezone:", e);
    }

    // Load guest booking history from localStorage
    try {
      const history = JSON.parse(localStorage.getItem("chronoai_guest_bookings") || "[]");
      setBookingHistory(history);
    } catch (e) {
      console.warn("Failed to load booking history:", e);
    }
  }, []);

  // Sync initial state with search parameters if they exist
  useEffect(() => {
    const qName = searchParams.get("guestName");
    const qEmail = searchParams.get("guestEmail");
    const qPhone = searchParams.get("guestPhone");
    const qNotes = searchParams.get("notes");

    if (qName) setGuestName(qName);
    if (qEmail) setGuestEmail(qEmail);
    if (qPhone) setGuestPhone(qPhone);
    if (qNotes) setNotes(qNotes);
  }, [searchParams]);

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

  const handleAddGuest = () => {
    const email = newGuestEmail.trim();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (additionalGuests.includes(email)) {
      setError("This guest email has already been added.");
      return;
    }
    setError(null);
    setAdditionalGuests((prev) => [...prev, email]);
    setNewGuestEmail("");
  };

  const handleRemoveGuest = (index: number) => {
    setAdditionalGuests((prev) => prev.filter((_, idx) => idx !== index));
  };

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

    // Parse and validate additional guest emails
    const guestsList = [...additionalGuests];
    if (newGuestEmail.trim()) {
      const trimmedNew = newGuestEmail.trim();
      if (!EMAIL_RE.test(trimmedNew)) {
        setError(`Please enter a valid email for the unsaved guest: ${trimmedNew}`);
        return;
      }
      if (!guestsList.includes(trimmedNew)) {
        guestsList.push(trimmedNew);
      }
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
          additionalGuests: guestsList,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create booking");
      }

      // Save to localStorage history
      try {
        const historyItem = {
          id: json.data.id,
          eventTypeId,
          eventTitle: json.data.eventType?.title || "Meeting",
          hostName,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          notes: notes.trim(),
          timestamp: new Date().toISOString(),
        };
        const existingHistory = JSON.parse(localStorage.getItem("chronoai_guest_bookings") || "[]");
        localStorage.setItem(
          "chronoai_guest_bookings",
          JSON.stringify([historyItem, ...existingHistory].slice(0, 5))
        );
      } catch (e) {
        console.error("Local storage booking history save failed:", e);
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
        <Label className="mb-3 block">Available times ({timezone})</Label>
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
                {formatSlotTime(slot.startTime, timezone)}
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
          <Label htmlFor="newGuestEmail">Additional guest emails (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="newGuestEmail"
              type="email"
              value={newGuestEmail}
              onChange={(e) => setNewGuestEmail(e.target.value)}
              placeholder="guest@example.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGuest();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddGuest}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
            >
              +
            </Button>
          </div>
          {additionalGuests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {additionalGuests.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-md text-xs font-medium"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveGuest(idx)}
                    className="text-violet-500 hover:text-violet-700 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
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
            Booking {formatSlotTime(selectedSlot.startTime, timezone)} ({timezone}) on {selectedDate} ·{" "}
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

      {/* Guest Booking History & Quick Re-booking */}
      {bookingHistory.length > 0 && (
        <div className="border-t border-gray-100 pt-6 space-y-3">
          <Label className="block font-semibold text-gray-800">Your recent bookings</Label>
          <div className="space-y-2">
            {bookingHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.eventTitle}</p>
                  <p className="text-xs text-gray-400">with {item.hostName} · {item.guestEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGuestName(item.guestName);
                    setGuestEmail(item.guestEmail);
                    setGuestPhone(item.guestPhone || "");
                    setNotes(item.notes || "");
                    if (item.eventTypeId !== eventTypeId && username) {
                      router.push(`/book/${username}/${item.eventTypeId}?guestName=${encodeURIComponent(item.guestName)}&guestEmail=${encodeURIComponent(item.guestEmail)}&guestPhone=${encodeURIComponent(item.guestPhone || "")}&notes=${encodeURIComponent(item.notes || "")}`);
                    } else {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="px-3 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-semibold rounded-md transition-colors"
                >
                  Book again
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

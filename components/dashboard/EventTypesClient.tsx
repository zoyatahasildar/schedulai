// components/dashboard/EventTypesClient.tsx
// Event Types UI (client) — real CRUD against /api/event-types
// Owned by: Lead
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Clock, Link2, Edit2, Trash2, Copy, ToggleLeft, ToggleRight,
  Calendar, TrendingUp, BarChart3, Share2, Loader2, ExternalLink,
} from "lucide-react";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;
const PALETTE = ["#7C3AED", "#06B6D4", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6"];

interface EventType {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  price: number;
  isActive: boolean;
  bookings: number;
}

function EventModal({ userId, initial, onClose, onSaved }: {
  userId: string;
  initial?: EventType | null;
  onClose: () => void;
  onSaved: (e: EventType) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? 30);
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [previewDate, setPreviewDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(today.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  // Availability editing (toggle slots on/off and save to the weekly schedule)
  const [editMode, setEditMode] = useState(false);
  const [onTimes, setOnTimes] = useState<Set<string>>(new Set());
  const [savingAvail, setSavingAvail] = useState(false);
  const [availMsg, setAvailMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getUTCFullYear());
  const [calMonth, setCalMonth] = useState(today.getUTCMonth());

  useEffect(() => {
    if (!showPreview) return;

    let active = true;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError("");
      try {
        const res = await fetch(`/api/availability/slots-preview?date=${previewDate}&duration=${duration}`);
        if (!res.ok) throw new Error("Failed to load availability slots");
        const data = await res.json();
        if (active) {
          if (data.success) {
            setSlots(data.slots || []);
          } else {
            setSlotsError(data.error || "Failed to load slots");
          }
        }
      } catch (err: any) {
        if (active) {
          setSlotsError(err.message || "Failed to fetch slots");
        }
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    fetchSlots();
    return () => {
      active = false;
    };
  }, [showPreview, previewDate, duration, refreshKey]);

  // Whenever slots (re)load, seed the editable "on" set from currently-available times.
  // Booked times count as "on" too, so saving never punches a gap around a booking.
  useEffect(() => {
    setOnTimes(
      new Set(
        slots
          .filter((s) => s.status === "available" || s.status === "booked")
          .map((s) => s.time)
      )
    );
  }, [slots]);

  const firstDay = new Date(Date.UTC(calYear, calMonth, 1)).getUTCDay();
  const totalDays = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1)
  ];

  const isDateToday = (day: number) => {
    const t = new Date();
    return (
      day === t.getUTCDate() &&
      calMonth === t.getUTCMonth() &&
      calYear === t.getUTCFullYear()
    );
  };

  const isDateSelected = (day: number) => {
    const yyyy = calYear;
    const mm = String(calMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return previewDate === `${yyyy}-${mm}-${dd}`;
  };

  const isDateInPast = (day: number) => {
    const cellDate = new Date(Date.UTC(calYear, calMonth, day, 23, 59, 59, 999));
    const t = new Date();
    return cellDate < t;
  };

  const handleDayClick = (day: number) => {
    const yyyy = calYear;
    const mm = String(calMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    setPreviewDate(`${yyyy}-${mm}-${dd}`);
  };

  const addSuggestedTime = (slot: any) => {
    const dateObj = new Date(slot.startTime);
    const formatted = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });
    const suggestionText = `Suggested time: ${formatted}`;

    if (desc.trim()) {
      setDesc((prev) => prev + "\n" + suggestionText);
    } else {
      setDesc(suggestionText);
    }
  };

  // ── Availability editing ──────────────────────────────
  // Toggle a 30-min slot on/off (booked slots can't be changed).
  const toggleSlot = (slot: any) => {
    if (slot.status === "booked") return;
    setOnTimes((prev) => {
      const next = new Set(prev);
      next.has(slot.time) ? next.delete(slot.time) : next.add(slot.time);
      return next;
    });
  };

  // Merge consecutive 30-min "HH:MM" starts into [startTime, endTime] windows.
  const mergeWindows = (times: string[]): { startTime: string; endTime: string }[] => {
    const mins = times
      .map((t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      })
      .sort((a, b) => a - b);

    const fmt = (x: number) => {
      const v = x >= 1440 ? 1439 : x;
      return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
    };

    const out: { startTime: string; endTime: string }[] = [];
    let start: number | null = null;
    let prev = 0;
    for (const mn of mins) {
      if (start === null) { start = mn; prev = mn; continue; }
      if (mn === prev + 30) { prev = mn; continue; }
      out.push({ startTime: fmt(start), endTime: fmt(prev + 30) });
      start = mn; prev = mn;
    }
    if (start !== null) out.push({ startTime: fmt(start), endTime: fmt(prev + 30) });
    return out;
  };

  const saveAvailability = async () => {
    setSavingAvail(true);
    setAvailMsg("");
    try {
      const dow = new Date(`${previewDate}T00:00:00Z`).getUTCDay();
      const windows = mergeWindows([...onTimes]);

      // Keep the other weekdays untouched (POST replaces the whole schedule).
      const existingRes = await fetch(`/api/availability?userId=${userId}`);
      const existingJson = await existingRes.json();
      const existing = existingJson.data ?? [];
      const others = existing
        .filter((a: any) => a.dayOfWeek !== dow)
        .map((a: any) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isActive: true,
        }));

      const newForDay = windows.map((w) => ({
        dayOfWeek: dow,
        startTime: w.startTime,
        endTime: w.endTime,
        isActive: true,
      }));

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: [...others, ...newForDay] }),
      });

      if (!res.ok) throw new Error("Failed to save availability");

      setEditMode(false);
      setAvailMsg("Availability updated ✓");
      setRefreshKey((k) => k + 1); // re-pull the preview from the server
      setTimeout(() => setAvailMsg(""), 2500);
    } catch (e) {
      setAvailMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingAvail(false);
    }
  };

  const submit = async () => {
    if (!title.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/event-types", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(initial ? { id: initial.id } : {}),
          title: title.trim(),
          description: desc.trim(),
          duration,
          price: price ? Number(price) : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onSaved({ ...json, bookings: initial?.bookings ?? 0 });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#131a2e] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[18px] font-bold text-white mb-5">{initial ? "Edit Event Type" : "New Event Type"}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Name</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Strategy Session"
              className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-[14px] bg-[#0f1629] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Duration</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-[14px] bg-[#131a2e] focus:outline-none focus:border-[#7C3AED]">
                {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Price (₹)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" placeholder="0 = Free"
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-[14px] bg-[#0f1629] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Describe this event type..."
              className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-[14px] bg-[#0f1629] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all resize-none" />
          </div>

          {/* Availability slots preview */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-[12px] font-bold text-[#06B6D4] hover:text-[#06B6D4]/80 transition-colors uppercase tracking-wider focus:outline-none"
            >
              📅 {showPreview ? "Hide available time slots" : "Show available time slots for this event"}
            </button>
            
            {showPreview && (
              <div className="mt-4 p-4 bg-[#0f1629] rounded-xl border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Calendar View Header */}
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-bold text-white/70">Select Date</h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-[11px] font-bold text-white px-2">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                  {DAY_LABELS.map((label, idx) => (
                    <div key={idx} className="font-bold text-white/30 py-1">
                      {label}
                    </div>
                  ))}
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    
                    const selected = isDateSelected(day);
                    const today_ = isDateToday(day);
                    const past = isDateInPast(day);
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={`
                          h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-[10px] font-semibold transition-all
                          ${selected 
                            ? "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold shadow-md shadow-[#7C3AED]/20 scale-105" 
                            : today_ 
                              ? "border border-[#06B6D4]/50 text-[#06B6D4]" 
                              : past 
                                ? "text-white/20 cursor-not-allowed" 
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                          }
                        `}
                        disabled={past}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Slots List */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[11px] font-bold text-white/60">
                      Time Slots ({previewDate})
                    </h5>
                    {!editMode ? (
                      <button
                        type="button"
                        onClick={() => { setEditMode(true); setAvailMsg(""); }}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] hover:text-[#7C3AED]/80 transition-colors"
                      >
                        ✏️ Edit availability
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={saveAvailability}
                          disabled={savingAvail}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-60"
                        >
                          {savingAvail && <Loader2 className="w-3 h-3 animate-spin" />} Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditMode(false); setRefreshKey((k) => k + 1); }}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2 text-[8px] font-bold uppercase tracking-wider text-white/40">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {editMode ? "On" : "Free"}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Booked</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/25" /> Off</span>
                    </div>
                    {editMode && <span className="text-[9px] text-[#7C3AED] font-semibold">Tap slots to toggle</span>}
                    {availMsg && <span className="text-[9px] text-emerald-400 font-semibold">{availMsg}</span>}
                  </div>

                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-6 text-white/40 text-[11px] gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" /> Loading slots...
                    </div>
                  ) : slotsError ? (
                    <div className="text-[10px] text-red-400 py-3 text-center">{slotsError}</div>
                  ) : slots.length === 0 ? (
                    <div className="text-[10px] text-white/40 py-3 text-center">No slots generated.</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {slots.map((slot) => {
                        const isBooked = slot.status === "booked";
                        // In edit mode, "available" reflects the toggled set; otherwise the server status.
                        const isAvailable = editMode ? onTimes.has(slot.time) : slot.status === "available";

                        return (
                          <div key={slot.time} className="relative group/slot">
                            <button
                              type="button"
                              onClick={() => {
                                if (editMode) {
                                  toggleSlot(slot);
                                } else if (isAvailable) {
                                  addSuggestedTime(slot);
                                }
                              }}
                              disabled={editMode ? isBooked : !isAvailable}
                              title={
                                isBooked && slot.booking
                                  ? `Booked by ${slot.booking.guestName}`
                                  : editMode
                                    ? "Tap to toggle availability"
                                    : undefined
                              }
                              className={`
                                w-full py-1.5 text-center text-[10px] font-bold rounded-lg border transition-all relative
                                ${isBooked
                                  ? "border-rose-500/20 bg-rose-500/5 text-rose-400/80 cursor-not-allowed"
                                  : isAvailable
                                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-95 cursor-pointer"
                                    : editMode
                                      ? "border-white/10 bg-white/[0.02] text-white/40 hover:border-emerald-500/30 hover:text-emerald-400/70 cursor-pointer"
                                      : "border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed"
                                }
                              `}
                            >
                              {slot.time}
                            </button>
                            
                            {/* Hover details for Booked Slots */}
                            {isBooked && slot.booking && (
                              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/slot:block bg-[#131a2e] border border-white/10 rounded-lg p-2 text-[9px] text-white/90 shadow-xl whitespace-nowrap pointer-events-none">
                                <p className="font-bold text-rose-400">Booked Meeting</p>
                                <p className="text-white/60">Guest: {slot.booking.guestName}</p>
                                <p className="text-white/40">{slot.booking.guestEmail}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/[0.06] text-white/80 text-[13px] font-semibold rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#7C3AED]/25 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EventTypesClient({ initialEvents, username, appUrl, userId }: {
  initialEvents: EventType[];
  username: string | null;
  appUrl: string;
  userId: string;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<EventType[]>(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EventType | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const host = appUrl.replace(/^https?:\/\//, "");
  const maxBookings = Math.max(1, ...events.map((e) => e.bookings));

  const linkFor = (id: string) =>
    username ? `${appUrl}/book/${username}?event=${id}` : null;

  const copyLink = (id: string) => {
    const url = linkFor(id);
    if (!url) { router.push("/dashboard/settings"); return; }
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const openLink = (id: string) => {
    const url = linkFor(id);
    if (!url) { router.push("/dashboard/settings"); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const toggleActive = async (e: EventType) => {
    setBusy(e.id);
    try {
      await fetch("/api/event-types", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, isActive: !e.isActive }),
      });
      setEvents((prev) => prev.map((x) => (x.id === e.id ? { ...x, isActive: !x.isActive } : x)));
      showNotification(`Event type "${e.title}" ${!e.isActive ? "enabled" : "disabled"}!`, "info");
    } finally {
      setBusy(null);
    }
  };

  const deleteEvent = async (e: EventType) => {
    if (!confirm(`Delete "${e.title}"? Its bookings will also be removed. This cannot be undone.`)) return;
    setBusy(e.id);
    try {
      await fetch(`/api/event-types?id=${e.id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((x) => x.id !== e.id));
      showNotification(`Event type "${e.title}" deleted successfully!`, "info");
    } finally {
      setBusy(null);
    }
  };

  const onSaved = (saved: EventType) => {
    const exists = events.some((x) => x.id === saved.id);
    if (exists) {
      showNotification(`Event type "${saved.title}" updated successfully!`, "success");
    } else {
      showNotification(`Event type "${saved.title}" created successfully!`, "success");
    }
    setEvents((prev) => {
      const exists = prev.some((x) => x.id === saved.id);
      return exists ? prev.map((x) => (x.id === saved.id ? { ...x, ...saved } : x)) : [saved, ...prev];
    });
    router.refresh();
  };

  const stats = [
    { label: "Total Types", value: events.length, grad: "from-[#7C3AED] to-[#6C63FF]", icon: "📋" },
    { label: "Active", value: events.filter((e) => e.isActive).length, grad: "from-[#10B981] to-[#06B6D4]", icon: "✅" },
    { label: "Total Bookings", value: events.reduce((a, e) => a + e.bookings, 0), grad: "from-[#EC4899] to-[#F59E0B]", icon: "📅" },
    { label: "Paid Types", value: events.filter((e) => e.price > 0).length, grad: "from-[#F59E0B] to-[#EC4899]", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8 md:px-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 bg-[#131a2e] border rounded-2xl shadow-2xl text-[13px] font-semibold text-white ${
            notification.type === "success" 
              ? "border-emerald-500/30 shadow-emerald-500/10" 
              : notification.type === "error" 
                ? "border-rose-500/30 shadow-rose-500/10" 
                : "border-blue-500/30 shadow-blue-500/10"
          }`}>
            <span className={`flex-shrink-0 w-2 h-2 rounded-full animate-pulse ${
              notification.type === "success" 
                ? "bg-emerald-500" 
                : notification.type === "error" 
                  ? "bg-rose-500" 
                  : "bg-blue-500"
            }`} />
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-white/40 hover:text-white transition-colors ml-2 font-normal text-[11px]"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white leading-tight">Event Types</h1>
          <p className="text-[14px] text-white/50 mt-1">Meeting types guests can book with you.</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> New Event Type
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className={`relative bg-gradient-to-br ${s.grad} rounded-2xl p-5 overflow-hidden shadow-lg`}>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <p className="text-3xl mb-1 relative">{s.icon}</p>
            <p className="text-[28px] font-black text-white leading-none relative" style={MONO}>{s.value}</p>
            <p className="text-[12px] text-white/80 font-semibold mt-1 relative">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-4">
        {events.length === 0 && (
          <div className="bg-[#131a2e] rounded-2xl p-12 text-center text-white/40 shadow-sm">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-[14px] font-medium">No event types yet — create your first one.</p>
          </div>
        )}
        {events.map((evt, i) => {
          const color = PALETTE[i % PALETTE.length];
          const fillPct = Math.round((evt.bookings / maxBookings) * 100);
          const url = linkFor(evt.id);
          return (
            <div key={evt.id} className={`bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden flex transition-all duration-300 hover:-translate-y-0.5 ${!evt.isActive ? "opacity-70" : ""}`}>
              <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
                    <Calendar className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[16px] font-bold text-white">{evt.title}</h3>
                  <span className={`ml-auto flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${evt.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-white/40"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${evt.isActive ? "bg-emerald-500" : "bg-white/30"}`} />
                    {evt.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {evt.description && <p className="text-[13px] text-white/50 mb-3 leading-relaxed">{evt.description}</p>}
                <div className="flex flex-wrap items-center gap-4 mb-3 text-[13px]">
                  <span className="flex items-center gap-1.5 text-white/80 font-semibold"><Clock className="w-3.5 h-3.5" style={{ color }} /> {evt.duration} min</span>
                  <span className="flex items-center gap-1.5 text-white/80 font-semibold" style={{ color }}>{evt.price > 0 ? `₹${evt.price}` : "Free"}</span>
                  <span className="flex items-center gap-1.5 text-white/80 font-semibold"><TrendingUp className="w-3.5 h-3.5" style={{ color }} /> {evt.bookings} bookings</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-xl mb-3 border border-white/[0.06]">
                  <Link2 className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open booking page in a new tab"
                      className="text-[11px] text-white/50 truncate flex-1 hover:text-white hover:underline transition-colors"
                      style={MONO}
                    >
                      {`${host}/book/${username}?event=${evt.id}`}
                    </a>
                  ) : (
                    <span className="text-[11px] text-white/50 truncate flex-1" style={MONO}>Set a username in Settings to get your link</span>
                  )}
                  <button onClick={() => copyLink(evt.id)} className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 text-white" style={{ backgroundColor: copied === evt.id ? "#10B981" : color }}>
                    {copied === evt.id ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => openLink(evt.id)} title="Open booking page" className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 bg-white/10 text-white hover:bg-white/20">
                    <ExternalLink className="w-3 h-3" /> Open
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-white/50">Booking share</span>
                    <span className="text-[11px] font-bold" style={{ color, ...MONO }}>{fillPct}%</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                  <button onClick={() => toggleActive(evt)} disabled={busy === evt.id} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50" style={{ backgroundColor: evt.isActive ? "#FEF3C7" : "#ECFDF5", color: evt.isActive ? "#D97706" : "#10B981" }}>
                    {evt.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {evt.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => router.push("/admin")} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#6C63FF]/15 text-[#7C3AED] hover:bg-[#6C63FF]/20 transition-colors">
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                  </button>
                  <button onClick={() => copyLink(evt.id)} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#00D4FF]/15 text-[#0099BB] hover:bg-[#00D4FF]/25 transition-colors">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={() => openLink(evt.id)} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </button>
                  <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => { setEditTarget(evt); setShowModal(true); }} className="p-2 rounded-lg text-[#7C3AED] bg-[#6C63FF]/15 hover:bg-[#6C63FF]/25 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => copyLink(evt.id)} className="p-2 rounded-lg text-[#0099BB] bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteEvent(evt)} disabled={busy === evt.id} className="p-2 rounded-lg text-red-400 bg-red-500/15 hover:bg-red-500/20 transition-all disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={() => { setEditTarget(null); setShowModal(true); }}
          className="w-full bg-[#131a2e] rounded-2xl border-2 border-dashed border-[#7C3AED]/25 p-6 flex items-center justify-center gap-4 hover:border-[#7C3AED]/60 hover:bg-[#131a2e] transition-all group shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/15 group-hover:bg-[#6C63FF]/20 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div className="text-left">
            <p className="text-[15px] font-bold text-white/65 group-hover:text-[#7C3AED] transition-colors">Add New Event Type</p>
            <p className="text-[13px] text-white/40 mt-0.5">Create a custom meeting type for your calendar</p>
          </div>
        </button>
      </div>

      {showModal && <EventModal userId={userId} initial={editTarget} onClose={() => setShowModal(false)} onSaved={onSaved} />}
    </div>
  );
}

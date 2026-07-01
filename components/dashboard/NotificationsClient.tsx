// components/dashboard/NotificationsClient.tsx
// Full-page notifications feed (blue themed).
// Pulls from /api/notifications/feed and shows two groups:
//   - Bookings   → booking CRUD (new / pending / rescheduled / cancelled / completed)
//   - Event Types → event-type CRUD (created / updated / deactivated)
// All times rendered in UTC (team rule #1). Owned by: Lead
"use client";

import { useEffect, useState } from "react";
import {
  Bell, RefreshCw, Calendar, Clock, CheckCircle, XCircle,
  CalendarClock, Plus, Pencil, EyeOff, User,
} from "lucide-react";

type BookingNotif = {
  id: string;
  type: "new" | "pending" | "rescheduled" | "cancelled" | "completed";
  title: string;
  message: string;
  at: string;
  guestName?: string;
  startTime?: string;
  duration?: number;
  status?: string;
};

type EventNotif = {
  id: string;
  type: "event_created" | "event_updated" | "event_deactivated";
  title: string;
  message: string;
  at: string;
};

// Status pill styling (kept inside the blue family).
const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  new:         { label: "New",         cls: "bg-[#3B82F6] text-white" },
  pending:     { label: "Pending",     cls: "bg-[#DBEAFE] text-[#1E3A8A]" },
  rescheduled: { label: "Rescheduled", cls: "bg-[#1D4ED8] text-white" },
  completed:   { label: "Completed",   cls: "bg-[#1E3A8A] text-white" },
  cancelled:   { label: "Cancelled",   cls: "bg-[#FEE2E2] text-[#991B1B]" },
};

const EVENT_ICON = {
  event_created: Plus,
  event_updated: Pencil,
  event_deactivated: EyeOff,
} as const;

function fmtUTC(iso?: string) {
  if (!iso) return "";
  return (
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

function rel(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationsClient() {
  const [bookings, setBookings] = useState<BookingNotif[]>([]);
  const [events, setEvents] = useState<EventNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"bookings" | "events">("bookings");

  const load = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/notifications/feed");
      const d = res.ok ? await res.json() : { bookings: [], events: [] };
      setBookings(d.bookings ?? []);
      setEvents(d.events ?? []);
    } catch {
      // keep previous data on failure
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [pageSeenTime, setPageSeenTime] = useState<number>(0);

  useEffect(() => {
    const prevSeen = Number(localStorage.getItem("chronoai_notif_seen") || 0);
    setPageSeenTime(prevSeen);

    const timer = setTimeout(() => {
      localStorage.setItem("chronoai_notif_seen", String(Date.now()));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(), 30000);
    return () => clearInterval(t);
  }, []);

  const total = bookings.length + events.length;
  const isEmpty = !loading && total === 0;

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
              <Bell className="w-5 h-5 text-white" />
            </span>
            <div>
              <h1 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight">Notifications</h1>
              <p className="text-[13px] text-white/50">
                Booking and event-type activity
              </p>
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] text-white/80 text-[13px] font-semibold border border-white/[0.08] shadow-sm hover:bg-white/[0.1] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Filter toggle — jump straight to either group */}
        {!loading && !isEmpty && (() => {
          const hasNewBookings = bookings.some((n) => new Date(n.at).getTime() > pageSeenTime);
          const hasNewEvents = events.some((n) => new Date(n.at).getTime() > pageSeenTime);
          return (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab("bookings")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
                  tab === "bookings"
                    ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm shadow-[#3B82F6]/30"
                    : "bg-white/[0.06] text-white/70 border-white/[0.08] hover:bg-white/[0.1]"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Bookings
                {hasNewBookings && (
                  <span className={`w-2 h-2 rounded-full ${tab === "bookings" ? "bg-white animate-pulse" : "bg-[#3B82F6] animate-pulse"}`} />
                )}
              </button>
              <button
                onClick={() => setTab("events")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
                  tab === "events"
                    ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-sm shadow-[#3B82F6]/30"
                    : "bg-white/[0.06] text-white/70 border-white/[0.08] hover:bg-white/[0.1]"
                }`}
              >
                <Pencil className="w-4 h-4" />
                Event Types
                {hasNewEvents && (
                  <span className={`w-2 h-2 rounded-full ${tab === "events" ? "bg-white animate-pulse" : "bg-[#3B82F6] animate-pulse"}`} />
                )}
              </button>
            </div>
          );
        })()}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-white/50 text-sm">
            <span className="w-5 h-5 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] animate-spin rounded-full" />
            Loading notifications...
          </div>
        ) : isEmpty ? (
          <div className="text-center py-20 bg-[#131a2e] rounded-2xl border border-white/[0.06] shadow-sm">
            <Bell className="w-10 h-10 text-[#3B82F6]/60 mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-white">You&apos;re all caught up! 🎉</p>
            <p className="text-[13px] text-white/50 mt-1">New bookings and event changes will show up here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Empty state for the active tab */}
            {tab === "bookings" && bookings.length === 0 && (
              <div className="text-center py-16 bg-[#131a2e] rounded-2xl border border-white/[0.06] shadow-sm">
                <CheckCircle className="w-9 h-9 text-[#3B82F6]/60 mx-auto mb-2" />
                <p className="text-[14px] font-semibold text-white">No booking activity yet.</p>
              </div>
            )}
            {tab === "events" && events.length === 0 && (
              <div className="text-center py-16 bg-[#131a2e] rounded-2xl border border-white/[0.06] shadow-sm">
                <Pencil className="w-9 h-9 text-[#3B82F6]/60 mx-auto mb-2" />
                <p className="text-[14px] font-semibold text-white">No event-type activity yet.</p>
              </div>
            )}

            {/* ── Bookings ─────────────────────────── */}
            {tab === "bookings" && bookings.length > 0 && (
              <section>
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-white/40 mb-3 px-1">
                  Bookings
                </h2>
                <div className="space-y-3">
                  {bookings.map((n) => {
                    const st = STATUS_STYLE[n.type] ?? STATUS_STYLE.new;
                    const Icon =
                      n.type === "cancelled" ? XCircle :
                      n.type === "completed" ? CalendarClock :
                      n.type === "pending"   ? Clock :
                      CheckCircle;
                    return (
                      <div
                        key={n.id}
                        className="bg-[#131a2e] border border-white/[0.06] border-l-4 border-l-[#3B82F6] rounded-xl p-4 shadow-sm hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-[#3B82F6]" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[14px] font-bold text-white leading-tight truncate">{n.title}</p>
                              <p className="text-[11px] text-white/40">{rel(n.at)}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2 text-[12px] text-white/60 font-medium pl-10">
                          {n.guestName && (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#3B82F6]/70 flex-shrink-0" />
                              {n.guestName}
                            </span>
                          )}
                          {n.startTime && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#3B82F6]/70 flex-shrink-0" />
                              {fmtUTC(n.startTime)}
                            </span>
                          )}
                          {typeof n.duration === "number" && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#3B82F6]/70 flex-shrink-0" />
                              {n.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Event Types ──────────────────────── */}
            {tab === "events" && events.length > 0 && (
              <section>
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-white/40 mb-3 px-1">
                  Event Types
                </h2>
                <div className="space-y-3">
                  {events.map((n) => {
                    const Icon = EVENT_ICON[n.type] ?? Pencil;
                    return (
                      <div
                        key={n.id}
                        className="bg-[#131a2e] border border-white/[0.06] border-l-4 border-l-[#60A5FA] rounded-xl p-4 shadow-sm hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#2563EB]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold text-white leading-tight truncate">{n.title}</p>
                            <p className="text-[12px] text-white/55 font-medium truncate">{n.message}</p>
                          </div>
                          <span className="text-[11px] text-white/40 flex-shrink-0">{rel(n.at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

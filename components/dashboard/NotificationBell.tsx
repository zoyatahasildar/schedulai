// components/dashboard/NotificationBell.tsx
// In-app notification box (bell dropdown) — shows Bookings and Events as separate sections.
// Owned by: Lead
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle, XCircle, CalendarClock, Clock, Plus, Pencil, EyeOff } from "lucide-react";

type Notif = {
  id: string;
  type: "new" | "cancelled" | "completed" | "pending" | "event_created" | "event_updated" | "event_deactivated";
  title: string;
  message: string;
  at: string;
  category: "booking" | "event";
};

const SEEN_KEY = "chronoai_notif_seen";

const STYLE = {
  new: { icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
  pending: { icon: Clock, color: "#F59E0B", bg: "#FFFBEB" },
  completed: { icon: CalendarClock, color: "#6C63FF", bg: "#F0EFFF" },
  cancelled: { icon: XCircle, color: "#EF4444", bg: "#FEF2F2" },
  event_created: { icon: Plus, color: "#10B981", bg: "#ECFDF5" },
  event_updated: { icon: Pencil, color: "#00B5CC", bg: "#ECFEFF" },
  event_deactivated: { icon: EyeOff, color: "#94A3B8", bg: "#F8FAFC" },
} as const;

function rel(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifRow({ n }: { n: Notif }) {
  const s = STYLE[n.type];
  const Icon = s.icon;
  return (
    <div className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
        <Icon className="w-4 h-4" style={{ color: s.color }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800">{n.title}</p>
        <p className="text-[12px] text-gray-500 truncate">{n.message}</p>
      </div>
      <span className="text-[11px] text-gray-400 flex-shrink-0">{rel(n.at)}</span>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="px-4 py-1.5 bg-gray-50 border-y border-gray-100 flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <span className="text-[10px] text-gray-400">{count}</span>
    </div>
  );
}

export function NotificationBell() {
  const [bookings, setBookings] = useState<Notif[]>([]);
  const [events, setEvents] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeen(Number(localStorage.getItem(SEEN_KEY) || 0));
    let cancelled = false;
    const load = () => {
      fetch("/api/notifications/feed")
        .then((r) => (r.ok ? r.json() : { bookings: [], events: [] }))
        .then((d) => {
          if (!cancelled) {
            setBookings(d.bookings ?? []);
            setEvents(d.events ?? []);
          }
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const allItems = [...bookings, ...events];
  const unread = allItems.filter((n) => new Date(n.at).getTime() > seen).length;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setSeen(now);
    }
  };

  const isEmpty = bookings.length === 0 && events.length === 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-[14px] font-bold text-gray-900">Notifications</p>
            {!isEmpty && (
              <span className="text-[11px] text-gray-400">{allItems.length} recent</span>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isEmpty ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">No notifications yet.</p>
                <p className="text-[12px] text-gray-300 mt-1">New bookings and event changes will appear here.</p>
              </div>
            ) : (
              <>
                {bookings.length > 0 && (
                  <>
                    <SectionHeader label="Bookings" count={bookings.length} />
                    {bookings.map((n) => <NotifRow key={n.id} n={n} />)}
                  </>
                )}
                {events.length > 0 && (
                  <>
                    <SectionHeader label="Events" count={events.length} />
                    {events.map((n) => <NotifRow key={n.id} n={n} />)}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

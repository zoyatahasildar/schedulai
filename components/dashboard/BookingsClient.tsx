// components/dashboard/BookingsClient.tsx
// Bookings UI (client) — real data, status updates via /api/booking, CSV export
// Owned by: Lead
"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, Clock, Video, CheckCircle, XCircle, AlertCircle,
  Calendar, ChevronDown, MoreHorizontal, Download, Loader2,
} from "lucide-react";
import { CancelModal } from "@/components/booking/CancelModal";
import { RescheduleModal } from "@/components/booking/RescheduleModal";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;
type Status = "confirmed" | "pending" | "cancelled" | "completed";

interface Booking {
  id: string;
  name: string;
  email: string;
  type: string;
  duration: number;
  startTime: string;
  status: Status;
  price: number;
  color: string;
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  confirmed: { label: "Confirmed", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  cancelled: { label: "Cancelled", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  completed: { label: "Completed", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
};

const TABS: { id: Status | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 8;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancelNotification = async () => {
    if (!cancelModalBooking) return;
    
    // Update status locally in DB
    await fetch("/api/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: cancelModalBooking.id, status: "CANCELLED" }),
    });
    
    // Notify guests
    const res = await fetch("/api/notifications/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: cancelModalBooking.id }),
    });
    
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === cancelModalBooking.id ? { ...b, status: "cancelled" } : b)));
      showToast("Booking cancelled & guest notified!");
    } else {
      showToast("Failed to notify guest", "error");
    }
  };

  const handleRescheduleNotification = async (newStartTime: string) => {
    if (!rescheduleModalBooking) return;
    
    const newEnd = new Date(new Date(newStartTime).getTime() + rescheduleModalBooking.duration * 60000).toISOString();
    const oldEnd = new Date(new Date(rescheduleModalBooking.startTime).getTime() + rescheduleModalBooking.duration * 60000).toISOString();

    const res = await fetch("/api/notifications/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: rescheduleModalBooking.id,
        previousStartTime: rescheduleModalBooking.startTime,
        previousEndTime: oldEnd,
        newStartTime: newStartTime,
        newEndTime: newEnd,
      }),
    });

    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === rescheduleModalBooking.id ? { ...b, startTime: newStartTime } : b)));
      showToast("Booking rescheduled & guest notified!");
    } else {
      showToast("Failed to reschedule booking", "error");
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [bookings]);

  const revenue = bookings
    .filter((b) => b.price > 0 && b.status !== "cancelled")
    .reduce((a, b) => a + b.price, 0);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchTab = activeTab === "all" || b.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch = b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.type.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [bookings, activeTab, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const updateStatus = async (id: string, status: Status) => {
    setBusy(id);
    setOpenMenu(null);
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, status: status.toUpperCase() }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      }
    } finally {
      setBusy(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Guest", "Email", "Event Type", "Date", "Time", "Duration (min)", "Price (INR)", "Status"],
      ...filtered.map((b) => [
        b.name, b.email, b.type, fmtDate(b.startTime), fmtTime(b.startTime),
        String(b.duration), b.price > 0 ? String(b.price) : "0", b.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = [
    { label: "Total", value: String(bookings.length), color: "#6C63FF", bg: "#F0EFFF", icon: "📅" },
    { label: "Confirmed", value: String(counts.confirmed || 0), color: "#10B981", bg: "#ECFDF5", icon: "✅" },
    { label: "Pending", value: String(counts.pending || 0), color: "#F59E0B", bg: "#FFFBEB", icon: "⏳" },
    { label: "Revenue", value: `₹${revenue}`, color: "#EC4899", bg: "#FDE8F4", icon: "💰" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Bookings</h1>
          <p className="text-[14px] text-gray-500 mt-1">Track and manage all your scheduled appointments.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-[#F0EFFF] text-[#6C63FF] text-[13px] font-bold rounded-xl hover:bg-[#E8E7FF] transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summary.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-[20px]" style={{ backgroundColor: s.bg }}>{s.icon}</div>
            <div>
              <p className="text-[24px] font-bold leading-none" style={{ ...MONO, color: s.color }}>{s.value}</p>
              <p className="text-[12px] text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`relative px-4 py-2.5 text-[13px] font-semibold transition-all ${activeTab === tab.id ? "text-[#6C63FF]" : "text-gray-500 hover:text-gray-800"}`}>
                {tab.label}
                {counts[tab.id] !== undefined && (
                  <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-[#F0EFFF] text-[#6C63FF]" : "bg-gray-100 text-gray-500"}`}>{counts[tab.id]}</span>
                )}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search bookings..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-[13px] w-56 focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 transition-all" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70">
                {["Guest", "Event Type", "Date & Time", "Duration", "Price", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400" style={MONO}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => {
                const s = STATUS_CONFIG[b.status];
                const initials = b.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                return (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}88)` }}>{initials}</div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800">{b.name}</p>
                          <p className="text-[11px] text-gray-400">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2"><Video className="w-3.5 h-3.5 text-gray-400" /><span className="text-[13px] text-gray-700 font-medium">{b.type}</span></div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{fmtDate(b.startTime)}</span>
                        <span className="text-gray-400">·</span>
                        <span style={MONO} className="text-[12px]">{fmtTime(b.startTime)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><div className="flex items-center gap-1 text-[13px] text-gray-600"><Clock className="w-3.5 h-3.5 text-gray-400" /><span style={MONO}>{b.duration} min</span></div></td>
                    <td className="px-5 py-3.5"><span className="text-[13px] font-semibold text-gray-800" style={MONO}>{b.price > 0 ? `₹${b.price}` : <span className="text-gray-400 font-normal">Free</span>}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2 relative">
                        {new Date(b.startTime) > new Date() && b.status !== "cancelled" && (
                          <>
                            <button
                              onClick={() => setRescheduleModalBooking(b)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#6C63FF] bg-[#F0EFFF] hover:bg-[#E8E7FF] rounded-md transition-colors whitespace-nowrap"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)} disabled={busy === b.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all flex-shrink-0">
                          {busy === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </button>
                        {openMenu === b.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-44 z-10">
                            <button onClick={() => updateStatus(b.id, "confirmed")} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 font-medium text-gray-700">Mark Confirmed</button>
                            <button onClick={() => updateStatus(b.id, "completed")} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 font-medium text-gray-700">Mark Completed</button>
                            <button onClick={() => updateStatus(b.id, "cancelled")} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 font-medium text-red-500">Cancel Booking</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-[14px] font-medium">No bookings found</p>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between">
            <p className="text-[13px] text-gray-500">Showing <span className="font-semibold text-gray-800">{paged.length}</span> of <span className="font-semibold text-gray-800">{filtered.length}</span> bookings</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${p === safePage ? "bg-[#6C63FF] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {cancelModalBooking && (
        <CancelModal
          isOpen={true}
          onClose={() => setCancelModalBooking(null)}
          onConfirm={handleCancelNotification}
          bookingName={cancelModalBooking.name}
        />
      )}
      
      {rescheduleModalBooking && (
        <RescheduleModal
          isOpen={true}
          onClose={() => setRescheduleModalBooking(null)}
          onConfirm={handleRescheduleNotification}
          bookingName={rescheduleModalBooking.name}
          currentStartTime={rescheduleModalBooking.startTime}
        />
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white z-50 transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

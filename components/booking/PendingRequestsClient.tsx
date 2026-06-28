// components/booking/PendingRequestsClient.tsx
// Pending booking requests — review + accept/reject (client)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════
// Styling mirrors the existing dashboard (BookingsClient): #6C63FF accent,
// rounded-2xl cards, mono numerals, soft shadows. All actions stay in the
// same tab (fetch + local state update / router.refresh).

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock, Calendar, Mail, User, MessageSquare, CheckCircle, XCircle,
  Loader2, Inbox, Phone,
} from "lucide-react";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

interface PendingRequest {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  eventTitle: string;
  duration: number;
  price: number;
  startTime: string;
  endTime: string;
  message: string | null;
  status: string;
  createdAt: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC",
  });
}

export function PendingRequestsClient({
  initialRequests,
  confirmedCount,
}: {
  initialRequests: PendingRequest[];
  confirmedCount: number;
}) {
  const router = useRouter();
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests);
  const [confirmed, setConfirmed] = useState(confirmedCount);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRequests[0]?.id ?? null
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const act = async (id: string, action: "accept" | "reject") => {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/booking/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to ${action}`);

      // Remove from the pending list + update counters
      setRequests((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (selectedId === id) setSelectedId(next[0]?.id ?? null);
        return next;
      });
      if (action === "accept") setConfirmed((c) => c + 1);
      router.refresh(); // keep server data (history, other views) in sync
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header + count badges */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Pending Requests</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Review and approve booking requests before they&apos;re confirmed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[13px] font-bold text-gray-700 shadow-sm">
            Bookings
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700" style={MONO}>
              {confirmed}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F0EFFF] rounded-xl text-[13px] font-bold text-[#6C63FF] shadow-sm">
            Pending Requests
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#6C63FF] text-white" style={MONO}>
              {requests.length}
            </span>
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] py-20 text-center text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-[15px] font-medium text-gray-500">No pending requests</p>
          <p className="text-[13px] mt-1">New booking requests will appear here for your approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Request list */}
          <div className="lg:col-span-2 space-y-3">
            {requests.map((r) => {
              const active = r.id === selectedId;
              const initials = r.guestName.split(" ").map((n) => n[0]).join("").slice(0, 2);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left bg-white rounded-2xl p-4 border transition-all ${
                    active ? "border-[#6C63FF] shadow-md" : "border-gray-100 hover:border-[#6C63FF]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 bg-gradient-to-br from-[#6C63FF] to-[#00D4FF]">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{r.guestName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{r.eventTitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      PENDING
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-2.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {fmtDate(r.startTime)}
                    <span className="text-gray-300">·</span>
                    <span style={MONO}>{fmtTime(r.startTime)} UTC</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Review panel */}
          <div className="lg:col-span-3">
            {selected && (
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6 lg:sticky lg:top-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900">{selected.eventTitle}</h2>
                    <p className="text-[13px] text-gray-500">
                      {selected.duration} min {selected.price > 0 ? `· ₹${selected.price}` : "· Free"}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    {selected.status}
                  </span>
                </div>

                <dl className="space-y-3.5">
                  <Row icon={User} label="Requester">{selected.guestName}</Row>
                  <Row icon={Mail} label="Email">
                    <a href={`mailto:${selected.guestEmail}`} className="text-[#6C63FF] hover:underline">
                      {selected.guestEmail}
                    </a>
                  </Row>
                  {selected.guestPhone && (
                    <Row icon={Phone} label="Phone">{selected.guestPhone}</Row>
                  )}
                  <Row icon={Calendar} label="Requested date">{fmtDate(selected.startTime)}</Row>
                  <Row icon={Clock} label="Requested time">
                    <span style={MONO}>{fmtTime(selected.startTime)} – {fmtTime(selected.endTime)} UTC</span>
                  </Row>
                  <Row icon={MessageSquare} label="Message">
                    {selected.message ? (
                      <span className="whitespace-pre-wrap">{selected.message}</span>
                    ) : (
                      <span className="text-gray-400 italic">No message provided</span>
                    )}
                  </Row>
                </dl>

                {/* Accept / Reject */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => act(selected.id, "accept")}
                    disabled={busy === selected.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    {busy === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => act(selected.id, "reject")}
                    disabled={busy === selected.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {busy === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">{label}</dt>
        <dd className="text-[14px] text-gray-800 mt-0.5">{children}</dd>
      </div>
    </div>
  );
}

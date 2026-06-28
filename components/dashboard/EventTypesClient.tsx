// components/dashboard/EventTypesClient.tsx
// Event Types UI (client) — real CRUD against /api/event-types
// Owned by: Lead
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Clock, Link2, Edit2, Trash2, Copy, ToggleLeft, ToggleRight,
  Calendar, TrendingUp, BarChart3, Share2, Loader2,
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

function EventModal({ initial, onClose, onSaved }: {
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[18px] font-bold text-gray-900 mb-5">{initial ? "Edit Event Type" : "New Event Type"}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Name</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Strategy Session"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Duration</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#7C3AED]">
                {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Price (₹)</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" placeholder="0 = Free"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Describe this event type..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all resize-none" />
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
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

export function EventTypesClient({ initialEvents, username, appUrl }: {
  initialEvents: EventType[];
  username: string | null;
  appUrl: string;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<EventType[]>(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EventType | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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

  const toggleActive = async (e: EventType) => {
    setBusy(e.id);
    try {
      await fetch("/api/event-types", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, isActive: !e.isActive }),
      });
      setEvents((prev) => prev.map((x) => (x.id === e.id ? { ...x, isActive: !x.isActive } : x)));
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
    } finally {
      setBusy(null);
    }
  };

  const onSaved = (saved: EventType) => {
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
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight">Event Types</h1>
          <p className="text-[14px] text-gray-500 mt-1">Meeting types guests can book with you.</p>
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
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-[14px] font-medium">No event types yet — create your first one.</p>
          </div>
        )}
        {events.map((evt, i) => {
          const color = PALETTE[i % PALETTE.length];
          const fillPct = Math.round((evt.bookings / maxBookings) * 100);
          const url = linkFor(evt.id);
          return (
            <div key={evt.id} className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden flex transition-all duration-300 hover:-translate-y-0.5 ${!evt.isActive ? "opacity-70" : ""}`}>
              <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
                    <Calendar className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900">{evt.title}</h3>
                  <span className={`ml-auto flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${evt.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${evt.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {evt.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {evt.description && <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">{evt.description}</p>}
                <div className="flex flex-wrap items-center gap-4 mb-3 text-[13px]">
                  <span className="flex items-center gap-1.5 text-gray-700 font-semibold"><Clock className="w-3.5 h-3.5" style={{ color }} /> {evt.duration} min</span>
                  <span className="flex items-center gap-1.5 text-gray-700 font-semibold" style={{ color }}>{evt.price > 0 ? `₹${evt.price}` : "Free"}</span>
                  <span className="flex items-center gap-1.5 text-gray-700 font-semibold"><TrendingUp className="w-3.5 h-3.5" style={{ color }} /> {evt.bookings} bookings</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl mb-3 border border-gray-100">
                  <Link2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[11px] text-gray-500 truncate flex-1" style={MONO}>{url ? `${host}/book/${username}?event=${evt.id}` : "Set a username in Settings to get your link"}</span>
                  <button onClick={() => copyLink(evt.id)} className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 text-white" style={{ backgroundColor: copied === evt.id ? "#10B981" : color }}>
                    {copied === evt.id ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-500">Booking share</span>
                    <span className="text-[11px] font-bold" style={{ color, ...MONO }}>{fillPct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => toggleActive(evt)} disabled={busy === evt.id} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50" style={{ backgroundColor: evt.isActive ? "#FEF3C7" : "#ECFDF5", color: evt.isActive ? "#D97706" : "#10B981" }}>
                    {evt.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {evt.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => router.push("/admin")} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#F0EFFF] text-[#7C3AED] hover:bg-[#E8E7FF] transition-colors">
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                  </button>
                  <button onClick={() => copyLink(evt.id)} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#E0F9FF] text-[#0099BB] hover:bg-[#C8F3FC] transition-colors">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => { setEditTarget(evt); setShowModal(true); }} className="p-2 rounded-lg text-[#7C3AED] bg-[#F0EFFF] hover:bg-[#E2E0FF] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => copyLink(evt.id)} className="p-2 rounded-lg text-[#0099BB] bg-[#E0F9FF] hover:bg-[#C8F3FC] transition-all"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteEvent(evt)} disabled={busy === evt.id} className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={() => { setEditTarget(null); setShowModal(true); }}
          className="w-full bg-white rounded-2xl border-2 border-dashed border-[#7C3AED]/25 p-6 flex items-center justify-center gap-4 hover:border-[#7C3AED]/60 hover:bg-[#F8F7FF] transition-all group shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EFFF] group-hover:bg-[#E8E7FF] flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div className="text-left">
            <p className="text-[15px] font-bold text-gray-600 group-hover:text-[#7C3AED] transition-colors">Add New Event Type</p>
            <p className="text-[13px] text-gray-400 mt-0.5">Create a custom meeting type for your calendar</p>
          </div>
        </button>
      </div>

      {showModal && <EventModal initial={editTarget} onClose={() => setShowModal(false)} onSaved={onSaved} />}
    </div>
  );
}

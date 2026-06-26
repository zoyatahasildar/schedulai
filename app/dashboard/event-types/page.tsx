// app/dashboard/event-types/page.tsx
// Event Types management page — full CRUD
// Owned by: Lead

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Clock, DollarSign, Trash2, ToggleLeft, ToggleRight, Edit2, Link2, Check } from "lucide-react";
import { useSession } from "next-auth/react";

interface EventType {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Create / Edit Modal ────────────────────────────────
function EventTypeModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (data: Partial<EventType> & { id?: string }) => Promise<void>;
  initial?: EventType | null;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    duration: initial?.duration?.toString() ?? "30",
    price: initial?.price?.toString() ?? "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave({
        title: form.title,
        description: form.description,
        duration: form.duration,
        price: form.price,
        ...(initial?.id && { id: initial.id }),
      });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {initial ? "Edit Event Type" : "Create Event Type"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 30 Min Coffee Chat"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this meeting about?"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 resize-none"
            />
          </div>

          {/* Duration + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration <span className="text-red-400">*</span>
              </label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 bg-white"
              >
                {[15, 30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-violet-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : initial ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function EventTypesPage() {
  const { data: session } = useSession();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EventType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEventTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/event-types");
      if (res.ok) {
        const data = await res.json();
        setEventTypes(data);
      }
    } catch (err) {
      console.error("Failed to fetch event types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const handleSave = async (data: Partial<EventType> & { id?: string }) => {
    const method = data.id ? "PATCH" : "POST";
    const res = await fetch("/api/event-types", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save");
    }
    await fetchEventTypes();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await fetch("/api/event-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    await fetchEventTypes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event type? All its bookings will also be deleted. This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/event-types?id=${id}`, { method: "DELETE" });
      await fetchEventTypes();
    } finally {
      setDeletingId(null);
    }
  };

  const copyLink = (eventTypeId: string) => {
    if (!session?.user?.username) {
      alert("Please set your username in Settings first.");
      return;
    }
    const url = `${window.location.origin}/book/${session.user.username}?event=${eventTypeId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(eventTypeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreate = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (et: EventType) => {
    setEditTarget(et);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create meeting types your guests can book
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event Type
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No event types yet</h3>
          <p className="text-sm text-gray-400 mb-5">
            Create your first event type to start accepting bookings
          </p>
          <button
            onClick={openCreate}
            className="bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Create Event Type
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {eventTypes.map((et) => (
            <div
              key={et.id}
              className={`bg-white rounded-xl border shadow-sm p-5 flex items-center justify-between transition-all ${
                et.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              {/* Left — info */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    et.isActive ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{et.title}</h3>
                  {et.description && (
                    <p className="text-sm text-gray-400 mt-0.5 truncate">{et.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {et.duration} min
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {et.price > 0 ? `$${et.price.toFixed(2)}` : "Free"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        et.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {et.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — actions */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                {/* Copy link */}
                <button
                  onClick={() => copyLink(et.id)}
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Copy booking link"
                >
                  {copiedId === et.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(et)}
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Toggle active */}
                <button
                  onClick={() => handleToggle(et.id, et.isActive)}
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  title={et.isActive ? "Deactivate" : "Activate"}
                >
                  {et.isActive ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(et.id)}
                  disabled={deletingId === et.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  {deletingId === et.id ? (
                    <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <EventTypeModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          initial={editTarget}
        />
      )}
    </div>
  );
}

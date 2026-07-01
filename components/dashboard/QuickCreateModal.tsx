"use client";

import { useState } from "react";
import { X, Plus, Trash2, Loader2, Calendar, Clock, Mail, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    const hr = String(h).padStart(2, "0");
    slots.push(`${hr}:00`);
    slots.push(`${hr}:30`);
  }
  return slots;
})();

export function QuickCreateModal({ isOpen, onClose, onSuccess }: QuickCreateModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Defaults to today's date
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddAttendee = () => {
    setAttendeeEmails([...attendeeEmails, ""]);
  };

  const handleRemoveAttendee = (index: number) => {
    const updated = attendeeEmails.filter((_, i) => i !== index);
    setAttendeeEmails(updated.length > 0 ? updated : [""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...attendeeEmails];
    updated[index] = value;
    setAttendeeEmails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Please enter a meeting title.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Please select start and end times.");
      return;
    }

    // Clean and validate emails
    const cleanedEmails = attendeeEmails
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (cleanedEmails.length === 0) {
      setError("Please add at least one attendee email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of cleanedEmails) {
      if (!emailRegex.test(email)) {
        setError(`Invalid email address: ${email}`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/meetings/quick-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          date,
          startTime,
          endTime,
          attendeeEmails: cleanedEmails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create quick meeting");
      }

      // Reset form (keep default date/times for next opening)
      setTitle("");
      setAttendeeEmails([""]);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#131a2e] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 text-left max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quick Create Meeting</h3>
              <p className="text-white/40 text-xs mt-0.5">Instantly schedule & generate Google Meet links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-white/70 text-xs font-semibold uppercase tracking-wider">Meeting Title</Label>
            <div className="relative">
              <Input
                id="title"
                placeholder="e.g. Sync & Design Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 text-white placeholder:text-white/20 h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-white/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/40" /> Date (UTC)
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 text-white h-10 rounded-xl [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-white/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" /> Start (UTC)
              </Label>
              <select
                id="startTime"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  const startIndex = TIME_SLOTS.indexOf(e.target.value);
                  if (startIndex !== -1 && startIndex < TIME_SLOTS.length - 1) {
                    setEndTime(TIME_SLOTS[startIndex + 1]);
                  }
                }}
                required
                className="flex w-full bg-[#1b233a] border border-white/[0.08] focus:border-violet-500/50 text-white h-10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot} className="bg-[#131a2e]">
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-white/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" /> End (UTC)
              </Label>
              <select
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="flex w-full bg-[#1b233a] border border-white/[0.08] focus:border-violet-500/50 text-white h-10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot} className="bg-[#131a2e]">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendee Emails */}
          <div className="space-y-2.5">
            <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-white/40" /> Attendee Emails
            </Label>
            <div className="space-y-2">
              {attendeeEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="attendee@gmail.com"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    required
                    className="bg-white/[0.03] border-white/[0.08] focus:border-violet-500/50 text-white placeholder:text-white/20 h-10 rounded-xl flex-1"
                  />
                  {attendeeEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(index)}
                      className="p-2.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddAttendee}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold mt-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add another attendee
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 leading-relaxed">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="bg-transparent border-white/[0.1] hover:bg-white/[0.05] text-white hover:text-white rounded-xl h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all h-10 border-0"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Scheduling..." : "Create Meeting"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

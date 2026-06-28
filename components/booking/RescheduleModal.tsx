import { useState } from "react";
import { X, Calendar as CalendarIcon, Loader2 } from "lucide-react";

export function RescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  bookingName,
  currentStartTime,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDateTime: string) => Promise<void>;
  bookingName: string;
  currentStartTime: string;
}) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!date || !time) return;
    setLoading(true);
    try {
      const newDateTime = new Date(`${date}T${time}`).toISOString();
      await onConfirm(newDateTime);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-[#F0EFFF] flex items-center justify-center text-[#6C63FF] mb-4">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Booking</h3>
          <p className="text-gray-500 text-sm mb-6">
            Select a new date and time for your booking with <span className="font-semibold text-gray-700">{bookingName}</span>. They will receive an email notification.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !date || !time}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#6C63FF] hover:bg-[#5a52d5] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reschedule"}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

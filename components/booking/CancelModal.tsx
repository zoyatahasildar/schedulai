import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

export function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  bookingName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookingName: string;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking</h3>
          <p className="text-gray-500 text-sm mb-6">
            Are you sure you want to cancel the booking with <span className="font-semibold text-gray-700">{bookingName}</span>? This action will notify the guest and cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Booking"}
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

// components/booking/BookingConfirmation.tsx
// Presentational booking confirmation card (server-friendly)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

import { CheckCircle2, Calendar, Clock, User, Mail } from "lucide-react";

interface BookingConfirmationProps {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  hostName: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

function formatDateUTC(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatTimeUTC(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export function BookingConfirmation({
  guestName,
  guestEmail,
  eventTitle,
  hostName,
  startTime,
  endTime,
  status,
}: BookingConfirmationProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-9 h-9 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking confirmed!</h1>
      <p className="text-gray-500 mb-6">
        A confirmation email is on its way to {guestEmail}.
      </p>

      <div className="text-left bg-gray-50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">{eventTitle}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
            {status}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          with {hostName}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          {formatDateUTC(startTime)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          {formatTimeUTC(startTime)} – {formatTimeUTC(endTime)} UTC
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          {guestName} ({guestEmail})
        </div>
      </div>
    </div>
  );
}

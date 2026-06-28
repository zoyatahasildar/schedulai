// components/booking/BookingConfirmation.tsx
// Booking confirmation card — status-aware, with reschedule/cancel + history
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════
// Handles the full approval lifecycle a guest may land on:
//   PENDING   → request submitted, awaiting host approval
//   CONFIRMED → accepted / booked
//   CANCELLED → withdrawn or cancelled
//   REJECTED  → declined by host
// Reschedule/Cancel actions show only while the booking is still active
// (PENDING or CONFIRMED).

import { CheckCircle2, XCircle, Clock3, Ban, Calendar, Clock, User, Mail } from "lucide-react";
import { BookingActions } from "@/components/booking/BookingActions";
import { BookingHistory, type BookingHistoryItem } from "@/components/booking/BookingHistory";

interface BookingConfirmationProps {
  bookingId: string;
  eventTypeId: string;
  duration: number;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  hostName: string;
  startTime: Date;
  endTime: Date;
  status: string;
  history: BookingHistoryItem[];
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

type StatusKey = "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED" | "COMPLETED";

const STATUS_VIEW: Record<
  StatusKey,
  {
    icon: typeof CheckCircle2;
    iconWrap: string;
    iconColor: string;
    badge: string;
    title: string;
    subtitle: (guestEmail: string, hostName: string) => string;
    active: boolean;
  }
> = {
  PENDING: {
    icon: Clock3,
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    title: "Request sent",
    subtitle: (_e, hostName) => `Waiting for ${hostName} to confirm your request.`,
    active: true,
  },
  CONFIRMED: {
    icon: CheckCircle2,
    iconWrap: "bg-green-100",
    iconColor: "text-green-600",
    badge: "bg-green-50 text-green-600",
    title: "Booking confirmed!",
    subtitle: (guestEmail) => `A confirmation email is on its way to ${guestEmail}.`,
    active: true,
  },
  COMPLETED: {
    icon: CheckCircle2,
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-50 text-blue-600",
    title: "Booking completed",
    subtitle: () => "This meeting has taken place.",
    active: false,
  },
  CANCELLED: {
    icon: XCircle,
    iconWrap: "bg-red-100",
    iconColor: "text-red-600",
    badge: "bg-red-50 text-red-600",
    title: "Booking cancelled",
    subtitle: () => "This booking has been cancelled. The record is kept below.",
    active: false,
  },
  REJECTED: {
    icon: Ban,
    iconWrap: "bg-red-100",
    iconColor: "text-red-600",
    badge: "bg-red-50 text-red-600",
    title: "Request declined",
    subtitle: (_e, hostName) => `${hostName} was unable to accept this request.`,
    active: false,
  },
};

export function BookingConfirmation({
  bookingId,
  eventTypeId,
  duration,
  guestName,
  guestEmail,
  eventTitle,
  hostName,
  startTime,
  endTime,
  status,
  history,
}: BookingConfirmationProps) {
  const view = STATUS_VIEW[(status as StatusKey)] ?? STATUS_VIEW.CONFIRMED;
  const Icon = view.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${view.iconWrap}`}
      >
        <Icon className={`w-9 h-9 ${view.iconColor}`} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{view.title}</h1>
      <p className="text-gray-500 mb-6">{view.subtitle(guestEmail, hostName)}</p>

      <div className="text-left bg-gray-50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">{eventTitle}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${view.badge}`}>{status}</span>
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

      {/* Reschedule / Cancel — only while the booking is still active */}
      {view.active && (
        <BookingActions
          bookingId={bookingId}
          eventTypeId={eventTypeId}
          duration={duration}
        />
      )}

      {/* Audit trail */}
      <BookingHistory history={history} />
    </div>
  );
}

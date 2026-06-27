// app/dashboard/bookings/page.tsx
// All bookings — upcoming + past
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    classes: "text-amber-600 bg-amber-50 border-amber-200",
    Icon: AlertCircle,
  },
  CONFIRMED: {
    label: "Confirmed",
    classes: "text-green-600 bg-green-50 border-green-200",
    Icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "text-red-600 bg-red-50 border-red-200",
    Icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    classes: "text-gray-500 bg-gray-50 border-gray-200",
    Icon: CheckCircle2,
  },
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  const allBookings = await prisma.booking.findMany({
    where: { eventType: { userId: session!.user.id } },
    include: { eventType: true },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();

  const upcoming = allBookings.filter(
    (b) =>
      new Date(b.startTime) >= now &&
      (b.status === "PENDING" || b.status === "CONFIRMED")
  );

  const past = allBookings.filter(
    (b) =>
      new Date(b.startTime) < now ||
      b.status === "CANCELLED" ||
      b.status === "COMPLETED"
  );

  const stats = [
    { label: "Total", value: allBookings.length, color: "violet" },
    { label: "Upcoming", value: upcoming.length, color: "blue" },
    {
      label: "Confirmed",
      value: allBookings.filter((b) => b.status === "CONFIRMED").length,
      color: "green",
    },
    {
      label: "Cancelled",
      value: allBookings.filter((b) => b.status === "CANCELLED").length,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">All your scheduled meetings</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
          >
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {allBookings.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No bookings yet</h3>
          <p className="text-sm text-gray-400">
            Share your booking link to start receiving meetings
          </p>
        </div>
      )}

      {/* Upcoming bookings */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Upcoming
              <span className="ml-2 bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {upcoming.map((booking) => {
              const { label, classes, Icon } = STATUS_CONFIG[booking.status];
              return (
                <div key={booking.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {booking.guestEmail}
                      </p>
                      <p className="text-xs text-violet-600 mt-0.5">
                        {booking.eventType.title} · {booking.eventType.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${classes}`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(booking.startTime)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(booking.startTime)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past / Cancelled bookings */}
      {past.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-600">Past & Cancelled</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {past.map((booking) => {
              const { label, classes, Icon } = STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className="px-5 py-4 flex items-center justify-between gap-4 opacity-65"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-700 truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {booking.guestEmail}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {booking.eventType.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${classes}`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.startTime)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

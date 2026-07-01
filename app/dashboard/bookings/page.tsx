// app/dashboard/bookings/page.tsx
// All bookings — upcoming + past
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react";
import { BookingActions } from "@/components/dashboard/BookingActions";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    classes: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    Icon: AlertCircle,
  },
  CONFIRMED: {
    label: "Confirmed",
    classes: "text-green-300 bg-green-500/15 border-green-500/30",
    Icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "text-red-300 bg-red-500/15 border-red-500/30",
    Icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    classes: "text-white/50 bg-white/[0.04] border-white/10",
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

  const hostUser = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { username: true },
  });
  const hostUsername = hostUser?.username || "";

  const allBookings = await prisma.booking.findMany({
    where: { eventType: { userId: session!.user.id } },
    include: { eventType: { include: { user: true } } },
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
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8 md:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-white/50 text-sm mt-1">All your scheduled meetings</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#131a2e] rounded-xl border border-white/[0.06] shadow-sm p-4 text-center"
          >
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-white/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {allBookings.length === 0 && (
        <div className="bg-[#131a2e] rounded-2xl border border-white/[0.06] shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-violet-300" />
          </div>
          <h3 className="font-semibold text-white/80 mb-1">No bookings yet</h3>
          <p className="text-sm text-white/40">
            Share your booking link to start receiving meetings
          </p>
        </div>
      )}

      {/* Upcoming bookings */}
      {upcoming.length > 0 && (
        <div className="bg-[#131a2e] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-semibold text-white">
              Upcoming
              <span className="ml-2 bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {upcoming.map((booking) => {
              const { label, classes, Icon } = STATUS_CONFIG[booking.status];
              return (
                <div key={booking.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-violet-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {booking.guestEmail}
                      </p>
                      <p className="text-xs text-violet-300 mt-0.5">
                        {booking.eventType.title} · {booking.eventType.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      {hostUsername && (
                        <a
                          href={`/book/${hostUsername}/${booking.eventTypeId}?guestName=${encodeURIComponent(booking.guestName)}&guestEmail=${encodeURIComponent(booking.guestEmail)}&guestPhone=${encodeURIComponent(booking.guestPhone || "")}&notes=${encodeURIComponent(booking.notes || "")}`}
                          target="_blank"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors whitespace-nowrap"
                        >
                          Book again
                        </a>
                      )}
                      <BookingActions
                        booking={{
                          id: booking.id,
                          name: booking.guestName,
                          startTime: booking.startTime.toISOString(),
                          duration: booking.eventType.duration,
                          status: booking.status,
                        }}
                      />
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${classes}`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white/80">
                      {formatDate(booking.startTime)}
                    </p>
                    <p className="text-xs text-white/40 flex items-center gap-1">
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
        <div className="bg-[#131a2e] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold text-white/65">Past & Cancelled</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {past.map((booking) => {
              const { label, classes, Icon } = STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className="px-5 py-4 flex items-center justify-between gap-4 opacity-65"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white/[0.06] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white/80 truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {booking.guestEmail}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {booking.eventType.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      {hostUsername && (
                        <a
                          href={`/book/${hostUsername}/${booking.eventTypeId}?guestName=${encodeURIComponent(booking.guestName)}&guestEmail=${encodeURIComponent(booking.guestEmail)}&guestPhone=${encodeURIComponent(booking.guestPhone || "")}&notes=${encodeURIComponent(booking.notes || "")}`}
                          target="_blank"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors whitespace-nowrap"
                        >
                          Book again
                        </a>
                      )}
                      <BookingActions
                        booking={{
                          id: booking.id,
                          name: booking.guestName,
                          startTime: booking.startTime.toISOString(),
                          duration: booking.eventType.duration,
                          status: booking.status,
                        }}
                      />
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${classes}`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">
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

// app/dashboard/page.tsx
// Dashboard home page — shown after login
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, Users, BarChart3, Plus, Copy } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  // Fetch stats
  const [eventTypesCount, bookingsCount, upcomingBookings] = await Promise.all([
    prisma.eventType.count({ where: { userId: user.id } }),
    prisma.booking.count({
      where: { eventType: { userId: user.id } },
    }),
    prisma.booking.findMany({
      where: {
        eventType: { userId: user.id },
        startTime: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { eventType: true },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ]);

  const bookingUrl = user.username
    ? `${process.env.NEXT_PUBLIC_APP_URL}/book/${user.username}`
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your schedule
          </p>
        </div>
        <Link
          href="/dashboard/event-types/new"
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event Type
        </Link>
      </div>

      {/* Booking Link Banner */}
      {user.username ? (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-violet-700">Your booking link</p>
            <p className="text-violet-600 font-mono text-sm mt-1">{bookingUrl}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(bookingUrl!)}
            className="flex items-center gap-2 bg-violet-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-700 font-medium text-sm">
            ⚠️ Set your username to get your booking link.{" "}
            <Link href="/dashboard/settings" className="underline">
              Go to Settings
            </Link>
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Event Types",
            value: eventTypesCount,
            icon: Calendar,
            color: "violet",
            href: "/dashboard/event-types",
          },
          {
            label: "Total Bookings",
            value: bookingsCount,
            icon: Users,
            color: "blue",
            href: "/dashboard/bookings",
          },
          {
            label: "Upcoming",
            value: upcomingBookings.length,
            icon: Clock,
            color: "green",
            href: "/dashboard/bookings",
          },
          {
            label: "Analytics",
            value: "→",
            icon: BarChart3,
            color: "purple",
            href: "/admin",
          },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Upcoming Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-violet-600 hover:underline">
            View all
          </Link>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No upcoming bookings yet</p>
            <p className="text-sm mt-1">Share your booking link to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{booking.guestName}</p>
                  <p className="text-sm text-gray-500">{booking.eventType.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(booking.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

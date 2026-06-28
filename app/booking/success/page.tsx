// app/booking/success/page.tsx
// Booking success / management page
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// Reached after a booking: /booking/success?bookingId=xxx
// Also serves as the guest's manage view (reschedule / cancel / history).

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";

interface SuccessPageProps {
  searchParams: { bookingId?: string };
}

// History reflects live data — don't cache this page.
export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const bookingId = searchParams.bookingId;

  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          eventType: { include: { user: true } },
          history: { orderBy: { createdAt: "desc" } },
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      {booking ? (
        <BookingConfirmation
          bookingId={booking.id}
          eventTypeId={booking.eventTypeId}
          duration={booking.eventType.duration}
          guestName={booking.guestName}
          guestEmail={booking.guestEmail}
          eventTitle={booking.eventType.title}
          hostName={booking.eventType.user.name ?? "your host"}
          startTime={booking.startTime}
          endTime={booking.endTime}
          status={booking.status}
          history={booking.history}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-9 h-9 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Booking not found
          </h1>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find that booking. It may have been cancelled or the
            link is incomplete.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-violet-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            Back to home
          </Link>
        </div>
      )}
    </div>
  );
}

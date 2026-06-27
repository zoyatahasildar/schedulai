// app/book/[username]/[eventId]/page.tsx
// PUBLIC booking flow — pick a slot and enter guest details for an event type.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { BookingFlow } from "@/components/booking/BookingFlow";

interface BookingFlowPageProps {
  params: { username: string; eventId: string };
}

export default async function BookingFlowPage({ params }: BookingFlowPageProps) {
  const eventType = await prisma.eventType.findUnique({
    where: { id: params.eventId },
    include: { user: true },
  });

  // Guard: event must exist, be active, and belong to this host
  if (
    !eventType ||
    !eventType.isActive ||
    eventType.user.username !== params.username
  ) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/book/${params.username}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {eventType.user.name}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Event header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{eventType.title}</h1>
                <p className="text-sm text-gray-500">with {eventType.user.name}</p>
              </div>
            </div>
            {eventType.description && (
              <p className="text-gray-600 mt-4">{eventType.description}</p>
            )}
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-4">
              <Clock className="w-4 h-4" />
              {formatDuration(eventType.duration)}
              <span className="text-gray-300">·</span>
              {eventType.price > 0 ? `$${eventType.price}` : "Free"}
            </p>
          </div>

          {/* Interactive booking flow */}
          <BookingFlow
            eventTypeId={eventType.id}
            duration={eventType.duration}
            hostName={eventType.user.name ?? "your host"}
          />
        </div>
      </div>
    </div>
  );
}

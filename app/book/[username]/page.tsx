// app/book/[username]/page.tsx
// PUBLIC host page — lists a host's active event types to book.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════

import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";

interface HostPageProps {
  params: { username: string };
}

export default async function HostBookingPage({ params }: HostPageProps) {
  const host = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      eventTypes: { where: { isActive: true }, orderBy: { duration: "asc" } },
    },
  });

  if (!host) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{host.name}</h1>
        </div>
        <p className="text-gray-500 mb-6">Select a meeting type to book</p>

        <div className="space-y-3">
          {host.eventTypes.map((et) => (
            <Link
              key={et.id}
              href={`/book/${host.username}/${et.id}`}
              className="group block border border-gray-200 rounded-xl p-4 hover:border-violet-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{et.title}</p>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors" />
              </div>
              {et.description && (
                <p className="text-sm text-gray-500 mt-1">{et.description}</p>
              )}
              <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                <Clock className="w-4 h-4" />
                {formatDuration(et.duration)}
                <span className="text-gray-300">·</span>
                {et.price > 0 ? `$${et.price}` : "Free"}
              </p>
            </Link>
          ))}
        </div>

        {host.eventTypes.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No event types available yet.
          </p>
        )}
      </div>
    </div>
  );
}

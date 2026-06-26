// app/book/[username]/page.tsx
// PUBLIC booking page — guests visit this to book a meeting
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// TODO Member 2:
// 1. Fetch host user by username from DB
// 2. Show their active event types
// 3. When guest picks event type, show calendar
// 4. Connect with Member 3's slot generation
// 5. Show booking form (name, email, notes)
// 6. On submit → POST /api/booking
// ═══════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface BookingPageProps {
  params: { username: string };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const host = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      eventTypes: { where: { isActive: true } },
    },
  });

  if (!host) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{host.name}</h1>
        <p className="text-gray-500 mb-6">Select a meeting type to book</p>

        {/* Member 2: Replace this with full booking UI */}
        <div className="space-y-3">
          {host.eventTypes.map((et) => (
            <div
              key={et.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-violet-400 cursor-pointer transition-colors"
            >
              <p className="font-medium text-gray-900">{et.title}</p>
              <p className="text-sm text-gray-500">
                {et.duration} min {et.price > 0 ? `· $${et.price}` : "· Free"}
              </p>
            </div>
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

// app/dashboard/event-types/page.tsx
// Event Types listing page (host dashboard)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventTypeList } from "@/components/booking/EventTypeList";

export default async function EventTypesPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 mt-1">
            Meeting types guests can book with you.
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

      <EventTypeList
        eventTypes={eventTypes}
        username={user.username}
        appUrl={process.env.NEXT_PUBLIC_APP_URL}
      />
    </div>
  );
}

// app/dashboard/event-types/new/page.tsx
// New Event Type page (host dashboard)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventTypeForm } from "@/components/booking/EventTypeForm";

export default function NewEventTypePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/event-types"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Types
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Event Type</h1>
        <p className="text-gray-500 mt-1">
          Define a meeting type that guests can book.
        </p>
      </div>

      <EventTypeForm />
    </div>
  );
}

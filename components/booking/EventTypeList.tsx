// components/booking/EventTypeList.tsx
// Presentational list of the host's event types (server-friendly)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import type { EventType } from "@/types";
import { formatDuration } from "@/lib/utils";

interface EventTypeListProps {
  eventTypes: EventType[];
  username: string | null;
  appUrl?: string;
}

export function EventTypeList({ eventTypes, username, appUrl }: EventTypeListProps) {
  if (eventTypes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">No event types yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Create your first event type so guests can book time with you.
        </p>
        <Link
          href="/dashboard/event-types/new"
          className="inline-flex items-center gap-2 mt-6 bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event Type
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {eventTypes.map((et) => {
        const publicLink =
          username && appUrl ? `${appUrl}/book/${username}/${et.id}` : null;
        return (
          <div
            key={et.id}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{et.title}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  et.isActive
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {et.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {et.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{et.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(et.duration)}</span>
              <span className="text-gray-300">·</span>
              <span>{et.price > 0 ? `$${et.price}` : "Free"}</span>
            </div>
            {publicLink && (
              <p className="text-xs text-violet-600 font-mono mt-4 truncate" title={publicLink}>
                {publicLink}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

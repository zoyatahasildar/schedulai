// components/dashboard/BookingActions.tsx
// Cancel + Reschedule buttons for a single booking row (dark theme).
// Reuses the existing CancelModal / RescheduleModal and booking APIs.
// On success it refreshes the server component so the row's status updates.
// Owned by: Lead
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CancelModal } from "@/components/booking/CancelModal";
import { RescheduleModal } from "@/components/booking/RescheduleModal";

interface Props {
  booking: {
    id: string;
    name: string;
    startTime: string; // ISO string
    duration: number;
    status: string;
  };
}

export function BookingActions({ booking }: Props) {
  const router = useRouter();
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  // Already cancelled → nothing to do.
  if (booking.status === "CANCELLED") return null;

  const handleCancel = async () => {
    // 1) flip the status in the DB
    await fetch("/api/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, status: "CANCELLED" }),
    });
    // 2) email the guest (non-fatal if it fails)
    await fetch("/api/notifications/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id }),
    }).catch(() => {});
    router.refresh();
  };

  const handleReschedule = async (newStartTime: string) => {
    const newEnd = new Date(
      new Date(newStartTime).getTime() + booking.duration * 60000
    ).toISOString();
    const oldEnd = new Date(
      new Date(booking.startTime).getTime() + booking.duration * 60000
    ).toISOString();

    // This route updates the booking time in the DB AND emails the guest.
    await fetch("/api/notifications/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.id,
        previousStartTime: booking.startTime,
        previousEndTime: oldEnd,
        newStartTime,
        newEndTime: newEnd,
      }),
    });
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowReschedule(true)}
          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-colors whitespace-nowrap"
        >
          Reschedule
        </button>
        <button
          onClick={() => setShowCancel(true)}
          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors whitespace-nowrap"
        >
          Cancel
        </button>
      </div>

      {showCancel && (
        <CancelModal
          isOpen={true}
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancel}
          bookingName={booking.name}
        />
      )}

      {showReschedule && (
        <RescheduleModal
          isOpen={true}
          onClose={() => setShowReschedule(false)}
          onConfirm={handleReschedule}
          bookingName={booking.name}
          currentStartTime={booking.startTime}
        />
      )}
    </>
  );
}

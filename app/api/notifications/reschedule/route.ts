// app/api/notifications/reschedule/route.ts
// Reschedule email notification API
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 4 (Notifications + Email module)
// Branch: feature/notifications-v2
// ═══════════════════════════════════════════════
// POST /api/notifications/reschedule
//   Body: {
//     bookingId: string,
//     previousStartTime: string (ISO),  // the OLD slot, for the "what changed" view
//     previousEndTime:   string (ISO)
//   }
//   - The booking record is expected to already hold the NEW startTime/endTime.
//   - Sends a reschedule notice to guest + host showing old → new time.
//   - Email-only: does not change booking data. Call AFTER the booking
//     is updated to the new time.
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRescheduleEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, previousStartTime, previousEndTime } = await req.json();

    if (!bookingId || !previousStartTime || !previousEndTime) {
      return NextResponse.json(
        {
          success: false,
          error: "bookingId, previousStartTime and previousEndTime are required",
        },
        { status: 400 }
      );
    }

    const prevStart = new Date(previousStartTime);
    const prevEnd = new Date(previousEndTime);
    if (Number.isNaN(prevStart.getTime()) || Number.isNaN(prevEnd.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid previous time(s)" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { eventType: { include: { user: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const result = await sendRescheduleEmail({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hostName: booking.eventType.user.name ?? "Your Host",
      hostEmail: booking.eventType.user.email,
      eventTitle: booking.eventType.title,
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes,
      previousStartTime: prevStart,
      previousEndTime: prevEnd,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Reschedule notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reschedule emails" },
      { status: 500 }
    );
  }
}

// app/api/notifications/reschedule/route.ts
// Handles booking rescheduling, database updates, and emails
// Owned by: Lead (re-implemented for ChronoAI notifications feature)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRescheduleEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, previousStartTime, previousEndTime, newStartTime, newEndTime } = await req.json();
    if (!bookingId || !newStartTime || !newEndTime) {
      return NextResponse.json(
        { success: false, error: "Missing required reschedule parameters" },
        { status: 400 }
      );
    }

    // Update the booking details in the database
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
      },
      include: { eventType: { include: { user: true } } },
    });

    const emailData = {
      guestName: updatedBooking.guestName,
      guestEmail: updatedBooking.guestEmail,
      hostName: updatedBooking.eventType.user.name ?? "Host",
      hostEmail: updatedBooking.eventType.user.email,
      eventTitle: updatedBooking.eventType.title,
      startTime: updatedBooking.startTime,
      endTime: updatedBooking.endTime,
      notes: updatedBooking.notes,
      meetingUrl: updatedBooking.meetingUrl,
      additionalGuests: updatedBooking.additionalGuests,
      previousStartTime: new Date(previousStartTime),
      previousEndTime: new Date(previousEndTime),
    };

    await sendRescheduleEmail(emailData);

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("Reschedule notification handler error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

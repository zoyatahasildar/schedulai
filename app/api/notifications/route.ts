// app/api/notifications/route.ts
// Handles new booking notifications and confirmation emails
// Owned by: Lead (re-implemented for ChronoAI notifications feature)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendHostNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { eventType: { include: { user: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const emailData = {
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hostName: booking.eventType.user.name ?? "Host",
      hostEmail: booking.eventType.user.email,
      eventTitle: booking.eventType.title,
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes,
      meetingUrl: booking.meetingUrl,
      additionalGuests: booking.additionalGuests,
    };

    await Promise.all([
      sendBookingConfirmation(emailData),
      sendHostNotification(emailData),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification handler error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// app/api/notifications/route.ts
// Email notification API
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 4 (Notifications + Email module)
// Branch: feature/notifications
// ═══════════════════════════════════════════════
// TODO Member 4:
// POST /api/notifications
//   - Called by Member 2's booking API after booking is created
//   - Accepts bookingId in body
//   - Sends confirmation to guest + notification to host
//   - Use Gemini to generate personalized email content
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation, sendHostNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        eventType: { include: { user: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const emailData = {
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hostName: booking.eventType.user.name ?? "Your Host",
      hostEmail: booking.eventType.user.email,
      eventTitle: booking.eventType.title,
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes,
    };

    // Send both emails
    const [guestEmail, hostEmail] = await Promise.all([
      sendBookingConfirmation(emailData),
      sendHostNotification(emailData),
    ]);

    return NextResponse.json({
      success: true,
      data: { guestEmail, hostEmail },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}

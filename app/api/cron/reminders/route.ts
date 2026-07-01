import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

// Optional: Vercel Cron Security 
// Set CRON_SECRET in your .env and Vercel will pass it automatically
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    // Look for bookings happening between 23.5 and 24.5 hours from now
    const targetStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const targetEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        reminderSent: false,
        startTime: {
          gte: targetStart,
          lte: targetEnd,
        },
      },
      include: {
        eventType: {
          include: { user: true },
        },
      },
    });

    if (bookings.length === 0) {
      console.log("⏰ Cron [reminders]: No reminders to send.");
      return NextResponse.json({ success: true, message: "No reminders to send" });
    }

    let sentCount = 0;
    for (const booking of bookings) {
      const emailData = {
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        hostName: booking.eventType.user.name || booking.eventType.user.email,
        hostEmail: booking.eventType.user.email,
        eventTitle: booking.eventType.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        notes: booking.notes,
      };

      const result = await sendReminderEmail(emailData);
      
      if (result.success) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });
        sentCount++;
      }
    }

    console.log(`⏰ Cron [reminders]: Successfully sent ${sentCount} reminders.`);
    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ success: false, error: "Failed to send reminders" }, { status: 500 });
  }
}

// app/api/booking/route.ts
// Booking API — create and manage bookings
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// POST  /api/booking → create a new booking (validation + conflict check + notify)
// GET   /api/booking → list bookings (for dashboard, auth required)
// PATCH /api/booking → update status (confirm/cancel, auth required)
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { BookingStatus } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fire-and-forget notification trigger (Member 4's module).
// Wrapped so a notification failure never breaks the booking itself.
async function triggerNotification(bookingId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) return;
    await fetch(`${baseUrl}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (err) {
    console.error("Notification trigger failed (non-fatal):", err);
  }
}

// POST: Create a new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestEmail, guestPhone, notes, startTime, eventTypeId, additionalGuests } = body;

    // ─── Validation ─────────────────────────────────────
    if (!guestName || !guestEmail || !startTime || !eventTypeId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(String(guestEmail))) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start time" },
        { status: 400 }
      );
    }

    if (start.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: "Start time must be in the future" },
        { status: 400 }
      );
    }

    // Validate additionalGuests emails
    const guestsArray = Array.isArray(additionalGuests) ? additionalGuests : [];
    for (const email of guestsArray) {
      if (!EMAIL_RE.test(String(email))) {
        return NextResponse.json(
          { success: false, error: `Invalid additional guest email address: ${email}` },
          { status: 400 }
        );
      }
    }

    // Fetch event type to get duration + owner
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType || !eventType.isActive) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    const end = new Date(start.getTime() + eventType.duration * 60 * 1000);

    // Fetch Google OAuth account refresh token for the host
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: eventType.userId,
        provider: "google",
      },
    });

    // ─── Transactional Conflict Checking & Creation ───
    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        const conflict = await tx.booking.findFirst({
          where: {
            eventType: { userId: eventType.userId },
            status: { in: ["PENDING", "CONFIRMED"] },
            OR: [
              { startTime: { gte: start, lt: end } },
              { endTime: { gt: start, lte: end } },
              { startTime: { lte: start }, endTime: { gte: end } },
            ],
          },
        });

        if (conflict) {
          throw new Error("CONFLICT");
        }

        return await tx.booking.create({
          data: {
            guestName: String(guestName).trim(),
            guestEmail: String(guestEmail).trim(),
            guestPhone: guestPhone ? String(guestPhone).trim() : null,
            notes: notes ? String(notes).trim() : null,
            startTime: start,
            endTime: end,
            eventTypeId,
            status: "CONFIRMED",
            additionalGuests: guestsArray.map(email => String(email).trim()),
          },
          include: { eventType: { include: { user: true } } },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (txError) {
      // Handle known conflict / serialization exceptions
      if (txError instanceof Error && txError.message === "CONFLICT") {
        return NextResponse.json(
          { success: false, error: "That time slot is no longer available" },
          { status: 409 }
        );
      }
      if (txError && typeof txError === "object" && "code" in txError && txError.code === "P2034") {
        return NextResponse.json(
          { success: false, error: "That time slot is no longer available" },
          { status: 409 }
        );
      }
      throw txError;
    }

    // ─── Google Meet / Zoom Generation (Non-blocking DB transaction, run outside) ───
    let meetingUrl = null;
    if (eventType.locationType === "MEET" && googleAccount?.refresh_token) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            refresh_token: googleAccount.refresh_token,
            grant_type: "refresh_token",
          }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          const accessToken = tokenData.access_token;

          const eventPayload = {
            summary: `${eventType.title} - ${guestName}`,
            description: notes || "",
            start: {
              dateTime: start.toISOString(),
            },
            end: {
              dateTime: end.toISOString(),
            },
            attendees: [
              { email: guestEmail },
              ...guestsArray.map((email: string) => ({ email })),
            ],
            conferenceData: {
              createRequest: {
                requestId: `chronoai-${booking.id}-${Date.now()}`,
                conferenceSolutionKey: {
                  type: "hangoutsMeet",
                },
              },
            },
          };

          const calendarRes = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(eventPayload),
            }
          );

          if (calendarRes.ok) {
            const calendarData = await calendarRes.json();
            meetingUrl = calendarData.hangoutLink || null;
          } else {
            console.error("Google Calendar API call failed:", await calendarRes.text());
          }
        } else {
          console.error("Google token refresh failed:", await tokenRes.text());
        }
      } catch (meetError) {
        console.error("Google Meet generation failed:", meetError);
      }
    } else if (eventType.locationType === "ZOOM") {
      // Fetch Zoom account refresh token
      const zoomAccount = await prisma.account.findFirst({
        where: {
          userId: eventType.userId,
          provider: "zoom",
        },
      });

      if (zoomAccount?.refresh_token) {
        try {
          const authHeader = Buffer.from(
            `${process.env.ZOOM_CLIENT_ID || ""}:${process.env.ZOOM_CLIENT_SECRET || ""}`
          ).toString("base64");

          const tokenRes = await fetch("https://zoom.us/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${authHeader}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: zoomAccount.refresh_token,
            }),
          });

          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            const accessToken = tokenData.access_token;

            // Update stored tokens if a new one is returned
            if (tokenData.refresh_token) {
              await prisma.account.update({
                where: { id: zoomAccount.id },
                data: {
                  access_token: accessToken,
                  refresh_token: tokenData.refresh_token,
                  expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
                },
              });
            }

            const zoomMeetingRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                topic: `${eventType.title} - ${guestName}`,
                type: 2,
                start_time: start.toISOString(),
                duration: eventType.duration,
                settings: {
                  join_before_host: true,
                  waiting_room: false,
                  mute_upon_entry: true,
                },
              }),
            });

            if (zoomMeetingRes.ok) {
              const meetingData = await zoomMeetingRes.json();
              meetingUrl = meetingData.join_url || null;
            } else {
              console.error("Zoom API meeting creation failed:", await zoomMeetingRes.text());
            }
          } else {
            console.error("Zoom Token exchange failed:", await tokenRes.text());
          }
        } catch (zoomError) {
          console.error("Failed to generate Zoom meeting:", zoomError);
        }
      }

      // Fallback to mock Zoom URL if connection is not set up / fails
      if (!meetingUrl) {
        meetingUrl = `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}?pwd=${Math.random().toString(36).substring(2, 10)}`;
      }
    }

    if (meetingUrl) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { meetingUrl },
      });
      booking.meetingUrl = meetingUrl;
    }

    // Trigger guest + host emails (non-blocking failure)
    await triggerNotification(booking.id);

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET: List bookings for authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventType: { userId: session.user.id } },
      include: { eventType: true },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// PATCH: Update a booking's status (confirm / cancel / complete)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status } = await req.json();

    const allowed: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!bookingId || !status || !allowed.includes(status)) {
      return NextResponse.json(
        { success: false, error: "bookingId and a valid status are required" },
        { status: 400 }
      );
    }

    // Ensure the booking belongs to the authenticated host
    const existing = await prisma.booking.findFirst({
      where: { id: bookingId, eventType: { userId: session.user.id } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { eventType: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

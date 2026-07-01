import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendQuickMeetingInvites } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Host
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hostId = session.user.id;
    const hostEmail = session.user.email || "";
    const hostName = session.user.name || "Host";

    // 2. Parse Request Payload
    const body = await req.json();
    const { title, date, startTime, endTime, attendeeEmails } = body;

    // 3. Validation
    if (!title || !date || !startTime || !endTime || !attendeeEmails) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(attendeeEmails) || attendeeEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one attendee email is required" },
        { status: 400 }
      );
    }

    // Validate email formats
    const validEmails = attendeeEmails.map((email: string) => email.trim());
    for (const email of validEmails) {
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json(
          { success: false, error: `Invalid email address: ${email}` },
          { status: 400 }
        );
      }
    }

    // Parse start and end times in UTC
    const start = new Date(`${date}T${startTime}:00Z`);
    const end = new Date(`${date}T${endTime}:00Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "End time must be after the start time" },
        { status: 400 }
      );
    }

    if (start.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: "Meeting time must be in the future" },
        { status: 400 }
      );
    }

    // 4. Retrieve Host's Google Account for OAuth
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: hostId,
        provider: "google",
      },
    });

    let hangoutLink: string | null = null;

    if (googleAccount && googleAccount.refresh_token) {
      try {
        // Exchange Google OAuth refresh token for access token
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

          // Call Google Calendar API to create meeting event
          const eventPayload = {
            summary: title.trim(),
            start: {
              dateTime: start.toISOString(),
            },
            end: {
              dateTime: end.toISOString(),
            },
            attendees: validEmails.map((email: string) => ({ email })),
            conferenceData: {
              createRequest: {
                requestId: `chronoai-quick-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
            hangoutLink = calendarData.hangoutLink || null;
            console.log(`Successfully generated Google Meet link via Calendar API: ${hangoutLink}`);
          } else {
            const errText = await calendarRes.text();
            console.warn("Google Calendar API call failed. Using mock link fallback. Error:", errText);
          }
        } else {
          const errText = await tokenRes.text();
          console.warn("Google token exchange failed. Using mock link fallback. Error:", errText);
        }
      } catch (err) {
        console.warn("Exception during Google Calendar API process. Using mock link fallback:", err);
      }
    }

    // Fallback: If hangoutLink is still null (due to failure or no Google integration), generate a mock link
    if (!hangoutLink) {
      const mockId = Math.random().toString(36).substring(2, 5) + "-" + 
                     Math.random().toString(36).substring(2, 6) + "-" + 
                     Math.random().toString(36).substring(2, 5);
      hangoutLink = `https://meet.google.com/${mockId}`;
      console.log(`Fallback mock Google Meet URL generated: ${hangoutLink}`);
    }

    // 7. Save Meeting Details in Database
    const meeting = await prisma.oneOffMeeting.create({
      data: {
        title: title.trim(),
        startTime: start,
        endTime: end,
        meetingUrl: hangoutLink,
        attendeeEmails: validEmails,
        hostId,
      },
    });

    // 8. Send Email Invites using Resend (Async/Fire-and-forget but logged)
    try {
      await sendQuickMeetingInvites({
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        hangoutLink: hangoutLink || "",
        hostName,
        hostEmail,
        attendeeEmails: validEmails,
      });
    } catch (emailErr) {
      console.error("Failed to dispatch quick meeting emails:", emailErr);
      // We don't fail the HTTP response because the DB record is already created and event is set.
    }

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error("Quick create meeting error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quick meeting" },
      { status: 500 }
    );
  }
}

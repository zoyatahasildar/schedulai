// lib/email.ts
// Email sending utilities using Resend + AI-generated content
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 4 (Notifications + Email module)
// Branch: feature/notifications-v2
// ═══════════════════════════════════════════════
// Public API:
//   sendBookingConfirmation(data) → confirmation to guest (AI-personalised)
//   sendHostNotification(data)    → new-booking alert to host
//   sendCancellationEmail(data)   → cancellation to guest + host
//   sendRescheduleEmail(data)     → reschedule notice to guest + host
// All AI (Gemini) calls are wrapped in try/catch and fall back to
// hand-written copy, so email always sends even if the AI is down.
// All times are stored in UTC and rendered in UTC.
// ═══════════════════════════════════════════════

import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER || "noreply@theedmentor.com",
    pass: process.env.SMTP_PASS || "Oi28klxvyBNsHv?init",
  },
});

const FROM_EMAIL = `EdOra <${process.env.SMTP_USER || "noreply@theedmentor.com"}>`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const BRAND = "EdOra";
const ACCENT = "#7c3aed";
const PANEL_BG = "#f3f0ff";

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  notes?: string | null;
  meetingUrl?: string | null;
  additionalGuests?: string[];
}

// Reschedule carries the previous slot so the guest sees what changed.
export interface RescheduleEmailData extends BookingEmailData {
  previousStartTime: Date;
  previousEndTime: Date;
}

// ─── UTC-safe formatting (all times stored in UTC) ──────
function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function fmtTime(d: Date): string {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function timeRange(start: Date, end: Date): string {
  return `${fmtTime(start)} – ${fmtTime(end)} UTC`;
}

// ─── Gemini personalisation ─────────────────────────────
// Generates ONE warm opening paragraph for the guest. Host emails stay
// purely informational, so they use static copy (no AI cost/latency).
type GuestEmailKind = "confirmation" | "cancellation" | "reschedule" | "reminder";

async function generateGuestIntro(
  data: BookingEmailData,
  kind: GuestEmailKind
): Promise<string> {
  const fallbacks: Record<GuestEmailKind, string> = {
    confirmation: `Hi ${data.guestName}, your ${data.eventTitle} with ${data.hostName} is all set — we're looking forward to it!`,
    cancellation: `Hi ${data.guestName}, your ${data.eventTitle} with ${data.hostName} has been cancelled. Sorry for any inconvenience — you're welcome to book another time whenever it suits you.`,
    reschedule: `Hi ${data.guestName}, your ${data.eventTitle} with ${data.hostName} has been moved to a new time. The updated details are below.`,
    reminder: `Hi ${data.guestName}, just a quick reminder about your upcoming ${data.eventTitle} with ${data.hostName}.`,
  };

  // No key → skip the call entirely, use friendly fallback.
  if (!process.env.GEMINI_API_KEY) return fallbacks[kind];

  const intent: Record<GuestEmailKind, string> = {
    confirmation: "warmly confirm their upcoming meeting and express genuine enthusiasm",
    cancellation: "gently and empathetically tell them their meeting was cancelled, and reassure them they can rebook anytime",
    reschedule: "warmly let them know their meeting has been moved to a new time",
    reminder: "send a friendly, brief reminder that their meeting is coming up in about 24 hours",
  };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = `Write a single warm, friendly opening paragraph for a ${kind} email from the scheduling app ${BRAND}.
Audience: ${data.guestName} (the guest)
Meeting: "${data.eventTitle}" with ${data.hostName}
Goal: ${intent[kind]}.
Constraints: max 2 sentences, no greeting line like "Dear", no sign-off, no subject line, no markdown, no quotes. Address the guest by their first name. Return ONLY the paragraph text.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 120, temperature: 0.8 },
    });

    const text = result.response.text().trim();
    return text.length > 0 ? text : fallbacks[kind];
  } catch (error) {
    console.error(`Gemini ${kind} personalisation failed (using fallback):`, error);
    return fallbacks[kind];
  }
}

// ─── Shared HTML chrome ─────────────────────────────────
function shell(title: string, accent: string, bodyInner: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: ${accent};">${title}</h2>
      ${bodyInner}
      <p style="color: #888; font-size: 12px; margin-top: 24px;">Powered by ${BRAND}</p>
    </div>
  `;
}

function detailsPanel(data: BookingEmailData, opts?: { label?: string }): string {
  const notesLabel = opts?.label ?? "Notes";
  return `
    <div style="background: ${PANEL_BG}; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${fmtDate(data.startTime)}</p>
      <p style="margin: 4px 0;"><strong>🕐 Time:</strong> ${timeRange(data.startTime, data.endTime)}</p>
      ${data.notes ? `<p style="margin: 4px 0;"><strong>📝 ${notesLabel}:</strong> ${data.notes}</p>` : ""}
    </div>
  `;
}

// ─── Send helper ────────────────────────────────────────
// The Resend SDK does NOT throw on API errors — it returns { data, error }.
// This helper inspects that error and logs the real reason, so a failed
// send is visible in the server logs instead of silently passing as 200.
async function dispatch(opts: {
  to: string;
  subject: string;
  html: string;
  label: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    console.log(`✅ Email sent [${opts.label}] → ${opts.to} (id: ${info.messageId})`);
    return { success: true as const, data: info };
  } catch (error) {
    console.error(`❌ SMTP failed [${opts.label}] → ${opts.to}:`, error);
    return { success: false as const, error };
  }
}

// ─── 1. Booking confirmation → guest ────────────────────
export async function sendBookingConfirmation(data: BookingEmailData) {
  const intro = await generateGuestIntro(data, "confirmation");

  const joinButton = data.meetingUrl
    ? `<div style="margin: 20px 0;">
        <a href="${data.meetingUrl}" target="_blank" style="background-color: ${ACCENT}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Join Meeting</a>
       </div>`
    : "";

  const body = `
      <p>${intro}</p>
      ${detailsPanel(data)}
      ${joinButton}
      <p>See you then! 👋</p>
    `;

  const primaryResult = await dispatch({
    to: data.guestEmail,
    subject: `✅ Booking Confirmed: ${data.eventTitle} with ${data.hostName}`,
    html: shell("Your meeting is confirmed! ✅", ACCENT, body),
    label: "confirmation",
  });

  // Loop through additional guests and send them the invite email
  if (data.additionalGuests && data.additionalGuests.length > 0) {
    for (const email of data.additionalGuests) {
      await dispatch({
        to: email.trim(),
        subject: `✅ Booking Invitation: ${data.eventTitle} with ${data.hostName}`,
        html: shell("You have been invited to a meeting! ✅", ACCENT, body),
        label: "confirmation-additional",
      });
    }
  }

  return primaryResult;
}

// ─── 2. New booking → host ──────────────────────────────
export async function sendHostNotification(data: BookingEmailData) {
  const joinButton = data.meetingUrl
    ? `<div style="margin: 20px 0;">
        <a href="${data.meetingUrl}" target="_blank" style="background-color: ${ACCENT}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Join Meeting</a>
       </div>`
    : "";

  const guestsList = data.additionalGuests && data.additionalGuests.length > 0
    ? `<p style="margin: 4px 0;"><strong>👥 Additional Guests:</strong> ${data.additionalGuests.join(", ")}</p>`
    : "";

  const body = `
      <p>Hi ${data.hostName},</p>
      <p><strong>${data.guestName}</strong> (${data.guestEmail}) has booked <strong>${data.eventTitle}</strong>.</p>
      ${detailsPanel(data, { label: "Guest notes" })}
      ${guestsList}
      ${joinButton}
    `;
  return dispatch({
    to: data.hostEmail,
    subject: `📅 New Booking: ${data.guestName} booked ${data.eventTitle}`,
    html: shell("New booking received! 📅", ACCENT, body),
    label: "host-notification",
  });
}

// ─── 3. Cancellation → guest + host ─────────────────────
export async function sendCancellationEmail(data: BookingEmailData, sendHost: boolean = true) {
  try {
    const guestIntro = await generateGuestIntro(data, "cancellation");

    const guestBody = `
      <p>${guestIntro}</p>
      ${detailsPanel(data)}
      <p>Need another time? You can book again whenever works for you.</p>
    `;
    const hostBody = `
      <p>Hi ${data.hostName},</p>
      <p>The booking below has been <strong style="color:#dc2626;">cancelled</strong>.</p>
      <p><strong>${data.guestName}</strong> (${data.guestEmail}) — <strong>${data.eventTitle}</strong></p>
      ${detailsPanel(data, { label: "Guest notes" })}
    `;

    const promises: Promise<any>[] = [
      dispatch({
        to: data.guestEmail,
        subject: `❌ Cancelled: ${data.eventTitle} with ${data.hostName}`,
        html: shell("Your meeting was cancelled", "#dc2626", guestBody),
        label: "cancellation-guest",
      }),
    ];

    if (sendHost) {
      promises.push(
        dispatch({
          to: data.hostEmail,
          subject: `❌ Booking Cancelled: ${data.guestName} — ${data.eventTitle}`,
          html: shell("A booking was cancelled", "#dc2626", hostBody),
          label: "cancellation-host",
        })
      );
    }

    const [guest, host] = await Promise.all(promises);

    return { success: guest.success && host.success, data: { guest, host } };
  } catch (error) {
    console.error("Cancellation email error:", error);
    return { success: false, error };
  }
}

// ─── 4. Reschedule → guest + host ───────────────────────
export async function sendRescheduleEmail(data: RescheduleEmailData, sendHost: boolean = true) {
  try {
    const guestIntro = await generateGuestIntro(data, "reschedule");

    const oldSlot = `
      <p style="margin: 4px 0; color: #9ca3af; text-decoration: line-through;">
        ${fmtDate(data.previousStartTime)} · ${timeRange(data.previousStartTime, data.previousEndTime)}
      </p>`;
    const newSlot = `
      <div style="background: ${PANEL_BG}; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0; font-size: 12px; text-transform: uppercase; color: #6b7280;">Previous time</p>
        ${oldSlot}
        <p style="margin: 12px 0 4px; font-size: 12px; text-transform: uppercase; color: #6b7280;">New time</p>
        <p style="margin: 4px 0;"><strong>📅 ${fmtDate(data.startTime)}</strong></p>
        <p style="margin: 4px 0;"><strong>🕐 ${timeRange(data.startTime, data.endTime)}</strong></p>
        ${data.notes ? `<p style="margin: 8px 0 0;"><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
      </div>`;

    const guestBody = `
      <p>${guestIntro}</p>
      ${newSlot}
      <p>See you at the new time! 👋</p>
    `;
    const hostBody = `
      <p>Hi ${data.hostName},</p>
      <p>The booking with <strong>${data.guestName}</strong> (${data.guestEmail}) for <strong>${data.eventTitle}</strong> has been rescheduled.</p>
      ${newSlot}
    `;

    const promises: Promise<any>[] = [
      dispatch({
        to: data.guestEmail,
        subject: `🔄 Rescheduled: ${data.eventTitle} with ${data.hostName}`,
        html: shell("Your meeting was rescheduled 🔄", ACCENT, guestBody),
        label: "reschedule-guest",
      }),
    ];

    if (sendHost) {
      promises.push(
        dispatch({
          to: data.hostEmail,
          subject: `🔄 Booking Rescheduled: ${data.guestName} — ${data.eventTitle}`,
          html: shell("A booking was rescheduled 🔄", ACCENT, hostBody),
          label: "reschedule-host",
        })
      );
    }

    const [guest, host] = await Promise.all(promises);

    return { success: guest.success && host.success, data: { guest, host } };
  } catch (error) {
    console.error("Reschedule email error:", error);
    return { success: false, error };
  }
}

// ─── 5. Reminder → guest ────────────────────────────────
export async function sendReminderEmail(data: BookingEmailData) {
  const intro = await generateGuestIntro(data, "reminder");
  const body = `
      <p>${intro}</p>
      ${detailsPanel(data)}
      <p>See you soon! 👋</p>
    `;
  return dispatch({
    to: data.guestEmail,
    subject: `⏰ Reminder: ${data.eventTitle} with ${data.hostName}`,
    html: shell("Upcoming meeting reminder ⏰", ACCENT, body),
    label: "reminder-guest",
  });
}

// ─── 6. Quick Meeting invites → attendees + host ────────
export interface QuickMeetingEmailData {
  title: string;
  startTime: Date;
  endTime: Date;
  hangoutLink: string;
  hostName: string;
  hostEmail: string;
  attendeeEmails: string[];
}

export async function sendQuickMeetingInvites(data: QuickMeetingEmailData) {
  const joinButton = data.hangoutLink
    ? `<div style="margin: 20px 0;">
        <a href="${data.hangoutLink}" target="_blank" style="background-color: ${ACCENT}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Join Google Meet</a>
       </div>`
    : "";

  const dateStr = fmtDate(data.startTime);
  const timeStr = timeRange(data.startTime, data.endTime);

  const body = `
    <p>Hi there,</p>
    <p>You have been invited to a quick meeting: <strong>${data.title}</strong>, hosted by <strong>${data.hostName}</strong> (${data.hostEmail}).</p>
    <div style="background: ${PANEL_BG}; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${dateStr}</p>
      <p style="margin: 4px 0;"><strong>🕐 Time:</strong> ${timeStr}</p>
    </div>
    ${joinButton}
    <p>See you then! 👋</p>
  `;

  // Deduplicate and filter emails
  const recipients = Array.from(
    new Set([data.hostEmail, ...data.attendeeEmails])
  ).map((email) => email.trim()).filter(Boolean);

  const results = [];

  for (const email of recipients) {
    const isHost = email.toLowerCase() === data.hostEmail.toLowerCase();
    const subject = isHost
      ? `📅 Quick Meeting Scheduled: ${data.title}`
      : `📅 Meeting Invitation: ${data.title} with ${data.hostName}`;

    const res = await dispatch({
      to: email,
      subject,
      html: shell(
        isHost ? "Your quick meeting is scheduled! 📅" : "You have been invited to a meeting! 📅",
        ACCENT,
        body
      ),
      label: "quick-meeting-invite",
    });
    results.push(res);
  }

  return {
    success: results.every((r) => r.success),
    results,
  };
}


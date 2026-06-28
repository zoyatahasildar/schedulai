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

import { Resend } from "resend";
import { GoogleGenerativeAI } from "@google/generative-ai";

const resend = new Resend(process.env.RESEND_API_KEY);

// onboarding@resend.dev is Resend's always-verified test sender.
// In test mode Resend only delivers to your own Resend account email.
// To send to real guests, verify a domain in Resend and set
// RESEND_FROM_EMAIL="ChronoAI <bookings@yourdomain.com>" — that's the only change needed.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const BRAND = "ChronoAI";
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
type GuestEmailKind = "confirmation" | "cancellation" | "reschedule";

async function generateGuestIntro(
  data: BookingEmailData,
  kind: GuestEmailKind
): Promise<string> {
  const fallbacks: Record<GuestEmailKind, string> = {
    confirmation: `Hi ${data.guestName}, your ${data.eventTitle} with ${data.hostName} is all set — we're looking forward to it!`,
    cancellation: `Hi ${data.guestName}, your ${data.eventTitle} with ${data.hostName} has been cancelled. Sorry for any inconvenience — you're welcome to book another time whenever it suits you.`,
    reschedule: `Hi ${data.guestName}, your ${data.eventTitle} with ${data.hostName} has been moved to a new time. The updated details are below.`,
  };

  // No key → skip the call entirely, use friendly fallback.
  if (!process.env.GEMINI_API_KEY) return fallbacks[kind];

  const intent: Record<GuestEmailKind, string> = {
    confirmation: "warmly confirm their upcoming meeting and express genuine enthusiasm",
    cancellation: "gently and empathetically tell them their meeting was cancelled, and reassure them they can rebook anytime",
    reschedule: "warmly let them know their meeting has been moved to a new time",
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
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      console.error(`❌ Resend failed [${opts.label}] → ${opts.to}:`, error);
      return { success: false as const, error };
    }

    console.log(`✅ Email sent [${opts.label}] → ${opts.to} (id: ${data?.id})`);
    return { success: true as const, data };
  } catch (error) {
    // Network / unexpected exceptions only.
    console.error(`❌ Email exception [${opts.label}] → ${opts.to}:`, error);
    return { success: false as const, error };
  }
}

// ─── 1. Booking confirmation → guest ────────────────────
export async function sendBookingConfirmation(data: BookingEmailData) {
  const intro = await generateGuestIntro(data, "confirmation");
  const body = `
      <p>${intro}</p>
      ${detailsPanel(data)}
      <p>See you then! 👋</p>
    `;
  return dispatch({
    to: data.guestEmail,
    subject: `✅ Booking Confirmed: ${data.eventTitle} with ${data.hostName}`,
    html: shell("Your meeting is confirmed! ✅", ACCENT, body),
    label: "confirmation",
  });
}

// ─── 2. New booking → host ──────────────────────────────
export async function sendHostNotification(data: BookingEmailData) {
  const body = `
      <p>Hi ${data.hostName},</p>
      <p><strong>${data.guestName}</strong> (${data.guestEmail}) has booked <strong>${data.eventTitle}</strong>.</p>
      ${detailsPanel(data, { label: "Guest notes" })}
    `;
  return dispatch({
    to: data.hostEmail,
    subject: `📅 New Booking: ${data.guestName} booked ${data.eventTitle}`,
    html: shell("New booking received! 📅", ACCENT, body),
    label: "host-notification",
  });
}

// ─── 3. Cancellation → guest + host ─────────────────────
export async function sendCancellationEmail(data: BookingEmailData) {
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

    const [guest, host] = await Promise.all([
      dispatch({
        to: data.guestEmail,
        subject: `❌ Cancelled: ${data.eventTitle} with ${data.hostName}`,
        html: shell("Your meeting was cancelled", "#dc2626", guestBody),
        label: "cancellation-guest",
      }),
      dispatch({
        to: data.hostEmail,
        subject: `❌ Booking Cancelled: ${data.guestName} — ${data.eventTitle}`,
        html: shell("A booking was cancelled", "#dc2626", hostBody),
        label: "cancellation-host",
      }),
    ]);

    return { success: guest.success && host.success, data: { guest, host } };
  } catch (error) {
    console.error("Cancellation email error:", error);
    return { success: false, error };
  }
}

// ─── 4. Reschedule → guest + host ───────────────────────
export async function sendRescheduleEmail(data: RescheduleEmailData) {
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

    const [guest, host] = await Promise.all([
      dispatch({
        to: data.guestEmail,
        subject: `🔄 Rescheduled: ${data.eventTitle} with ${data.hostName}`,
        html: shell("Your meeting was rescheduled 🔄", ACCENT, guestBody),
        label: "reschedule-guest",
      }),
      dispatch({
        to: data.hostEmail,
        subject: `🔄 Booking Rescheduled: ${data.guestName} — ${data.eventTitle}`,
        html: shell("A booking was rescheduled 🔄", ACCENT, hostBody),
        label: "reschedule-host",
      }),
    ]);

    return { success: guest.success && host.success, data: { guest, host } };
  } catch (error) {
    console.error("Reschedule email error:", error);
    return { success: false, error };
  }
}

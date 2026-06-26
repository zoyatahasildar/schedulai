// lib/email.ts
// Email sending utilities using Resend + AI-generated content
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 4 (Notifications + Email module)
// Branch: feature/notifications
// ═══════════════════════════════════════════════
// TODO Member 4:
// 1. sendBookingConfirmation(booking) → send to guest
// 2. sendHostNotification(booking) → send to host
// 3. sendCancellationEmail(booking) → send to guest + host
// 4. generateEmailContent(booking) → use Gemini to write email
// ═══════════════════════════════════════════════

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@schedulai.com";

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

/**
 * Send booking confirmation to guest
 * TODO Member 4: Add AI-generated email body using Gemini
 */
export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `✅ Booking Confirmed: ${data.eventTitle} with ${data.hostName}`,
      html: buildConfirmationEmail(data),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

/**
 * Send booking notification to host
 * TODO Member 4: Add AI-generated email body using Gemini
 */
export async function sendHostNotification(data: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.hostEmail,
      subject: `📅 New Booking: ${data.guestName} booked ${data.eventTitle}`,
      html: buildHostNotificationEmail(data),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Host notification error:", error);
    return { success: false, error };
  }
}

// ─── Email Templates ────────────────────────────────────
// TODO Member 4: Replace with AI-generated content from Gemini

function buildConfirmationEmail(data: BookingEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Your meeting is confirmed! ✅</h2>
      <p>Hi ${data.guestName},</p>
      <p>Your <strong>${data.eventTitle}</strong> with <strong>${data.hostName}</strong> has been confirmed.</p>
      <div style="background: #f3f0ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>📅 Date:</strong> ${data.startTime.toLocaleDateString()}</p>
        <p><strong>🕐 Time:</strong> ${data.startTime.toLocaleTimeString()} – ${data.endTime.toLocaleTimeString()}</p>
        ${data.notes ? `<p><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
      </div>
      <p>See you then!</p>
      <p style="color: #888; font-size: 12px;">Powered by SchedulAI</p>
    </div>
  `;
}

function buildHostNotificationEmail(data: BookingEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">New booking received! 📅</h2>
      <p>Hi ${data.hostName},</p>
      <p><strong>${data.guestName}</strong> (${data.guestEmail}) has booked <strong>${data.eventTitle}</strong>.</p>
      <div style="background: #f3f0ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>📅 Date:</strong> ${data.startTime.toLocaleDateString()}</p>
        <p><strong>🕐 Time:</strong> ${data.startTime.toLocaleTimeString()} – ${data.endTime.toLocaleTimeString()}</p>
        ${data.notes ? `<p><strong>📝 Guest notes:</strong> ${data.notes}</p>` : ""}
      </div>
      <p style="color: #888; font-size: 12px;">Powered by SchedulAI</p>
    </div>
  `;
}

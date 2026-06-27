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
import { GoogleGenerativeAI } from "@google/generative-ai";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

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
 * Generate email content using Gemini AI
 */
async function generateAIEmailContent(
  data: BookingEmailData,
  type: "confirmation" | "hostNotification" | "cancellation" | "reminder"
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Write a friendly, warm, and professional email for a booking ${type === "confirmation" ? "confirmation sent to the guest" :
      type === "hostNotification" ? "notification sent to the host about a new booking" :
        type === "cancellation" ? "cancellation notification sent to both the guest and host" :
          "reminder sent to the guest 24 hours before the meeting"
      }.

Details:
- Guest name: ${data.guestName}
- Host name: ${data.hostName}
- Event title: ${data.eventTitle}
- Date: ${data.startTime.toLocaleDateString()}
- Time: ${data.startTime.toLocaleTimeString()} - ${data.endTime.toLocaleTimeString()}
${data.notes ? `- Notes: ${data.notes}` : ""}

Return ONLY the HTML body content (no markdown, no wrapper). Keep it concise and human-like.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI email generation failed, using fallback:", error);
    // Fallback: return a simple HTML email
    return buildFallbackEmail(data, type);
  }
}

/**
 * Generate a consistent HTML email layout with SchedulAI branding
 */
function createEmailLayout(title: string, content: string, isCancellation?: boolean): string {
  const color = isCancellation ? "#dc2626" : "#7c3aed";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px; width: 100%;">
              <!-- Header with brand color -->
              <tr>
                <td style="background-color: ${color}; padding: 24px 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600;">SchedulAI</h1>
                  <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0;">Smart Scheduling, Powered by AI</p>
                </td>
              </tr>
              <!-- Main content -->
              <tr>
                <td style="padding: 32px 32px 24px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0;">Powered by SchedulAI &bull; <a href="#" style="color: #7c3aed; text-decoration: none;">Unsubscribe</a></p>
                  <p style="margin: 4px 0 0;">© ${new Date().getFullYear()} SchedulAI. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
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
      html: await generateAIEmailContent(data, "confirmation"),
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
      html: await generateAIEmailContent(data, "hostNotification"),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Host notification error:", error);
    return { success: false, error };
  }
}

/**
 * Send cancellation email to both guest and host
 * TODO Member 4: Add AI-generated cancellation email
 */
export async function sendCancellationEmail(data: BookingEmailData) {
  try {
    // Send to guest
    const guestResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `❌ Booking Cancelled: ${data.eventTitle} with ${data.hostName}`,
      html: await generateAIEmailContent(data, "cancellation"),
    });

    // Send to host
    const hostResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.hostEmail,
      subject: `❌ Cancellation: ${data.guestName} cancelled ${data.eventTitle}`,
      html: await generateAIEmailContent(data, "cancellation"), // same content but maybe we can customize
    });

    return { success: true, guest: guestResult, host: hostResult };
  } catch (error) {
    console.error("Cancellation email error:", error);
    return { success: false, error };
  }
}

/**
 * Send 24-hour reminder email to guest
 */
export async function sendReminderEmail(data: BookingEmailData) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `🔔 Reminder: Your ${data.eventTitle} with ${data.hostName} is tomorrow!`,
      html: await generateAIEmailContent(data, "reminder"),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Reminder email error:", error);
    return { success: false, error };
  }
}

// ─── Email Templates ────────────────────────────────────
// TODO Member 4: Replace with AI-generated content from Gemini

function buildConfirmationEmail(data: BookingEmailData): string {
  const content = `
    <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Your meeting is confirmed! ✅</h2>
    <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hi <strong>${data.guestName}</strong>,</p>
    <p style="color: #334155; font-size: 16px; line-height: 1.5;">Your <strong>${data.eventTitle}</strong> with <strong>${data.hostName}</strong> has been confirmed.</p>
    <div style="background: #f3f0ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${data.startTime.toLocaleDateString()}</p>
      <p style="margin: 4px 0;"><strong>🕐 Time:</strong> ${data.startTime.toLocaleTimeString()} – ${data.endTime.toLocaleTimeString()}</p>
      ${data.notes ? `<p style="margin: 4px 0;"><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
    </div>
    <p style="color: #334155; font-size: 16px; line-height: 1.5;">See you then!</p>
  `;
  return createEmailLayout("Booking Confirmed", content);
}

function buildHostNotificationEmail(data: BookingEmailData): string {
  const content = `
    <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">New booking received! 📅</h2>
    <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hi <strong>${data.hostName}</strong>,</p>
    <p style="color: #334155; font-size: 16px; line-height: 1.5;"><strong>${data.guestName}</strong> (${data.guestEmail}) has booked <strong>${data.eventTitle}</strong>.</p>
    <div style="background: #f3f0ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${data.startTime.toLocaleDateString()}</p>
      <p style="margin: 4px 0;"><strong>🕐 Time:</strong> ${data.startTime.toLocaleTimeString()} – ${data.endTime.toLocaleTimeString()}</p>
      ${data.notes ? `<p style="margin: 4px 0;"><strong>📝 Guest notes:</strong> ${data.notes}</p>` : ""}
    </div>
    <p style="color: #334155; font-size: 16px; line-height: 1.5;">Prepare for the meeting!</p>
  `;
  return createEmailLayout("New Booking", content);
}

/**
 * Fallback email template if AI generation fails
 */
function buildFallbackEmail(data: BookingEmailData, type: "confirmation" | "hostNotification" | "cancellation" | "reminder"): string {
  if (type === "confirmation") {
    return buildConfirmationEmail(data);
  } else if (type === "hostNotification") {
    return buildHostNotificationEmail(data);
  } else if (type === "cancellation") {
    const content = `
      <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Booking Cancelled ❌</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hi,</p>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Your <strong>${data.eventTitle}</strong> with <strong>${data.hostName}</strong> has been cancelled.</p>
      <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${data.startTime.toLocaleDateString()}</p>
        <p style="margin: 4px 0;"><strong>🕐 Time:</strong> ${data.startTime.toLocaleTimeString()} – ${data.endTime.toLocaleTimeString()}</p>
        ${data.notes ? `<p style="margin: 4px 0;"><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
      </div>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">If you have any questions, please reach out.</p>
    `;
    return createEmailLayout("Booking Cancelled", content, true);
  } else { // reminder
    const content = `
      <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Reminder: Your meeting is tomorrow! 🔔</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hi <strong>${data.guestName}</strong>,</p>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">This is a friendly reminder that your <strong>${data.eventTitle}</strong> with <strong>${data.hostName}</strong> is scheduled for tomorrow.</p>
      <div style="background: #f3f0ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${data.startTime.toLocaleDateString()}</p>
        <p style="margin: 4px 0;"><strong>🕐 Time:</strong> ${data.startTime.toLocaleTimeString()} – ${data.endTime.toLocaleTimeString()}</p>
        ${data.notes ? `<p style="margin: 4px 0;"><strong>📝 Notes:</strong> ${data.notes}</p>` : ""}
      </div>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">See you soon!</p>
    `;
    return createEmailLayout("Meeting Reminder", content);
  }
}



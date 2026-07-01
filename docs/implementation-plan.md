# Phase 2 & 3 Implementation Plan

## Architecture Exploration Findings

### 1. Data Flow for Booking Confirmation Email
1. **UI**: Guest visits `/book/<username>`, selects a slot, and submits the booking form.
2. **API (`app/api/booking/route.ts`)**: The form submits a POST request to `/api/booking`. The server validates the request, checks for time conflicts, and creates a new booking in the database (via Prisma).
3. **Notification Trigger**: The API calls `triggerNotification(bookingId)` which makes a non-blocking POST request to `/api/notifications`.
4. **Email Dispatch (`lib/email.ts`)**: The notifications API retrieves the booking details and calls `sendBookingConfirmation(data)` and `sendHostNotification(data)`. 
5. **Gemini Personalisation**: Inside `sendBookingConfirmation`, `generateGuestIntro` is called to generate a warm AI-personalised greeting.
6. **Resend API**: Finally, the `dispatch()` helper is called, which sends the email via the Resend API and logs the result.

### 2. Key File Paths Identified
- **Booking API**: `app/api/booking/route.ts`
- **Dispatch() Helper**: `lib/email.ts` (Lines 145-171)
- **Email Templates**: `lib/email.ts` (e.g., `shell()`, `detailsPanel()`, `sendBookingConfirmation()`)
- **Gemini Integration**: `lib/email.ts` (specifically `generateGuestIntro()` on Line 79)
- **Dashboard/Booking List UI**: `app/dashboard/bookings/page.tsx`

---

## User Review Required

Please review the proposed approach for the 24-hour reminder scheduling. 
> [!IMPORTANT]
> The plan assumes we will use an API endpoint triggered by a cron service (like Vercel Cron or GitHub Actions) rather than a continuously running Node process like `node-cron`, as this is standard for Next.js applications. Is this acceptable?

---

## Proposed Changes

### Feature A: 24-hour Reminder
We will implement an automated reminder email sent ~24 hours before the booking.

#### [MODIFY] [lib/email.ts](file:///d:/schedulai/lib/email.ts)
- Add a new `GuestEmailKind` called `"reminder"` in `generateGuestIntro`.
- Add an intent and fallback text for the reminder.
- Export a new function `sendReminderEmail(data: BookingEmailData)` that reuses `generateGuestIntro`, `shell`, and `detailsPanel` to compose the reminder email.

#### [NEW] [app/api/cron/reminders/route.ts](file:///d:/schedulai/app/api/cron/reminders/route.ts)
- Create a new API route designed to be triggered securely (e.g. using a secret cron key).
- The route will query Prisma for bookings where `startTime` is between 23 and 24 hours from `now()`, and status is `CONFIRMED`.
- It will loop through these bookings and call `sendReminderEmail` for each, then mark them as "reminder_sent" in the DB to avoid duplicates (requires a minor Prisma schema update).

#### [MODIFY] [prisma/schema.prisma](file:///d:/schedulai/prisma/schema.prisma)
- Add a boolean field `reminderSent @default(false)` to the `Booking` model so the cron job doesn't send duplicate reminders if it runs multiple times.

---

### Feature B: Cancel/Reschedule UI
We will add interactive buttons to the host dashboard to trigger the existing cancel and reschedule APIs.

#### [MODIFY] [app/dashboard/bookings/page.tsx](file:///d:/schedulai/app/dashboard/bookings/page.tsx)
- Add "Cancel" and "Reschedule" action buttons to each booking item in the list.
- Connect the "Cancel" button to a confirmation dialog.
- Connect the "Reschedule" button to the new RescheduleModal.

#### [NEW] [components/booking/RescheduleModal.tsx](file:///d:/schedulai/components/booking/RescheduleModal.tsx)
- Create a modal component that receives the current booking details.
- Include a Date Picker to allow the host to select a new date and time.
- On submit, this modal will call `POST /api/notifications/reschedule` with the new time.

#### [NEW] [components/booking/CancelModal.tsx](file:///d:/schedulai/components/booking/CancelModal.tsx)
- Create a simple confirmation modal to prevent accidental cancellations.
- On confirm, it will call `POST /api/notifications/cancel`.

---

## Verification Plan

### Automated Tests
- Run existing test suites.
- Verify TypeScript compilation succeeds after schema changes.

### Manual Verification
- **Feature A**: Manually trigger the `/api/cron/reminders` route with a test booking set for 23.5 hours in the future and verify the email is sent via Resend and logged in terminal.
- **Feature B**: Navigate to the dashboard bookings page. Click "Cancel", confirm the prompt, and verify the cancellation email fires. Click "Reschedule", pick a new time in the modal, and verify the reschedule email fires showing the old and new times.

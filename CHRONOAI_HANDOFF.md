# ChronoAI — Handoff Brief (Member 4: Notifications & Email)

> Paste the relevant parts of this file into a **fresh Claude session** that has the
> `D:\schedulai` folder connected. A fresh session is required — see "Why a fresh
> session" below.

---

## Who I am / the project
- App: **ChronoAI** — "Smart Scheduling, Powered by AI" (a Cal.com-style AI scheduling app).
  Old name was "SchedulAI"/"ScheduleAI" — that rename is mostly done but keeps creeping back via merges.
- Stack: **Next.js 14 (App Router)**, Tailwind + Shadcn UI, PostgreSQL + Prisma (Supabase),
  NextAuth (Google OAuth), Google **Gemini** (model `gemini-2.0-flash-lite`), **Resend** (email).
- Repo: https://github.com/zoyatahasildar/schedulai
- Me: **Member 4 — Notifications & Email**. GitHub: `sanafria`. Email: `lunafria196@gmail.com`.
- I work on Windows in the **Antigravity IDE** (PowerShell terminal). Project folder: `D:\schedulai`.
- My branch: `feature/notifications-v3` (committed & pushed).

## Team rules (follow strictly)
- All times stored & displayed in **UTC**.
- Secrets in `.env.local` ONLY (gitignored — never commit).
- All Gemini calls wrapped in try/catch with a non-AI fallback.
- **Feature branches only — NEVER commit/push to `main`.**
- Tailwind only; mobile-first; validate inputs; loading states on buttons; production-ready code.

---

## ⚠️ Why a fresh session (important)
The previous long-running session developed a **file-cache problem**: any file it had already
opened got "frozen" to a stale copy, so it could no longer see teammates' newer edits to those
files. Editing them would have overwritten teammates' work, so we stopped. **A fresh session does
not have this problem** and can read the true, current content of every file. If you ever see a
session insisting a file looks older than it should, that's the same bug — start fresh.

## ⚠️ Critical gotchas (these save hours)
1. **Email delivery**: the `RESEND_API_KEY` in `.env.local` is the team lead's Resend account
   (`zoyatahasildar1@gmail.com`). With sender `onboarding@resend.dev`, Resend **only delivers to
   that exact address**. To watch an email actually arrive, book with `zoyatahasildar1@gmail.com`
   as the guest. `RESEND_FROM_EMAIL="onboarding@resend.dev"` must be in `.env.local`.
2. **Booking IDs**: get real IDs from the app's `/booking/success?bookingId=...` URL, NOT from
   Prisma Studio. Next.js reads `DATABASE_URL` from `.env.local`; the Prisma CLI reads `.env` —
   they can point at different databases, so Studio IDs may not exist in the running app's DB.
3. **New API routes need a dev-server restart** to register (otherwise you get a 404).
4. **Clean restart** (PowerShell) to avoid a zombie server starting on port 3001:
   `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; npm run dev`
5. **Merges can revert the ChronoAI branding** back to SchedulAI/ScheduleAI — re-search after any merge.
6. **Gemini free tier** rate-limits (HTTP 429); the try/catch fallback handles it — emails still send.

---

## What's already DONE (don't redo)
My email module is complete and pushed (`lib/email.ts` + `app/api/notifications/{route,cancel,reschedule}`):
booking confirmation, host notification, cancellation, reschedule emails; Gemini-personalized intros
with fallback; UTC formatting; a `dispatch()` helper that logs real Resend results.

**Teammates have since added a lot — CHECK what already exists before building:**
- `app/api/cron/reminders/route.ts` — likely the 24h reminder.
- `components/booking/CancelModal.tsx`, `RescheduleModal.tsx`, `components/dashboard/BookingActions.tsx`
  — cancel/reschedule UI.
- `components/dashboard/NotificationBell.tsx`, `NotificationsClient.tsx`, `app/api/notifications/feed`,
  `app/dashboard/notifications/page.tsx` — a notification center.
- `components/charts/*`, `app/api/admin/*` — analytics.
- My `app/api/notifications/*` route files were modified by someone — reconcile, don't blindly overwrite.

---

## Git workflow (do this FIRST in the new session)
```powershell
# make sure my own work is committed, then pull teammates' latest:
git status
git fetch origin
git merge origin/main
# restart dev server cleanly afterward:
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; npm run dev
```
Work on a feature branch, commit locally, `git push -u origin <branch>`, then open a PR for the lead
to merge. **Never push to `main`.**

---

## How to work with me
- Do **ONE task at a time**. After each, tell me which files changed and what you did, then STOP and
  ask me to verify before moving on.
- **Read the real file first.** The paths in the task list are wrong — the actual UI lives in the
  `components/dashboard/*Client.tsx` files (the `app/dashboard/*/page.tsx` files are thin wrappers).
  Real locations:
  - Task 1 (Conversion Rate) → `components/dashboard/AnalyticsClient.tsx` (rendered by `app/admin/page.tsx`)
  - Tasks 2 & 7 (event URLs / banner) → `components/dashboard/EventTypesClient.tsx`
  - Task 4 (timezone picker) → `app/dashboard/settings/page.tsx`
  - Task 6 (booking counts/filters) → `components/dashboard/BookingsClient.tsx` (may be partly done — verify)
  - Task 5 (integrations page) → new page under the settings area; match the existing settings routing
- Some tasks touch other modules (analytics = Member 5, settings/calendar = Member 3, dashboard = Lead).
  Flag that so I can coordinate, and keep changes on my feature branch.

---

## TASK LIST (one at a time, in order)

### P0 — Quick wins
1. **Remove the "Conversion Rate" metric card** from analytics (keep Total Bookings, Active
   Bookings, Revenue). Real file: `components/dashboard/AnalyticsClient.tsx`. Note it appears in a
   few places (the KPI cards array, the CSV export, the share-summary text, and a sentence near the
   bottom) — remove the card cleanly and keep the others working.
2. **Make event URLs clickable** on the event-types page: wrap the booking URL in
   `<a href={url} target="_blank" rel="noopener noreferrer">`. Real file:
   `components/dashboard/EventTypesClient.tsx`.
3. **Fix branding**: search the whole project for `SchedulAI`/`ScheduleAI` and replace with `ChronoAI`.

### P1 — Core UX
4. **Timezone picker in settings**: a "Timezone" dropdown from `Intl.supportedValuesOf('timeZone')`,
   defaulting to the browser timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`), saved in
   global state (Context or Zustand) + persisted (localStorage or DB), and used for all date/time
   displays. Real file: `app/dashboard/settings/page.tsx` (+ a context/provider). Keep storage in UTC;
   only the *display* uses the chosen timezone.
5. **Integrations page UI**: two sections — Calendars (Google, Outlook, Apple) and Video apps
   (Google Meet, Zoom, WhatsApp Video), each with a clickable "Connect" button (`console.log` for now;
   OAuth later). Lucide icons. Create a new page under the settings area matching existing routing.
6. **Bookings page counts & filter tabs**: "Upcoming (n)", "Cancelled (n)", "Rescheduled (n)" with
   dynamic counts; clicking a tab filters the list by status. Real file:
   `components/dashboard/BookingsClient.tsx` — **check first**, a teammate may have already added this.

### P2 — Nice to have
7. **"Book a Meeting" banner/button** beside "+ New Event Type", linking to `/book/[username]`.
   Real file: `components/dashboard/EventTypesClient.tsx`.

### Additional requirements
Production-ready code; follow existing patterns; Tailwind + Shadcn; proper TypeScript types;
mobile responsive; all times stored & displayed in UTC.

---

**Start with Task 1**: read `components/dashboard/AnalyticsClient.tsx`, show me the exact lines you'll
change, and wait for my confirmation before applying.

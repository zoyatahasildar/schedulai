# ChronoAI — Team Setup Guide

> Smart Scheduling, Powered by AI

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/chronoai.git
cd chronoai

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Fill in your values in .env

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Run dev server
npm run dev
```

---

## Team Module Ownership

| Member   | Module              | Branch                | Key Files |
|----------|---------------------|-----------------------|-----------|
| **Lead** | Auth + AI Chatbot   | `feature/auth`        | `lib/auth.ts`, `app/login/`, `app/dashboard/`, `components/chatbot/` |
| Member 2 | Booking Engine      | `feature/booking`     | `app/book/`, `app/api/booking/`, `components/booking/` |
| Member 3 | Calendar + Timezone | `feature/calendar`    | `lib/slots.ts`, `app/api/availability/`, `components/calendar/` |
| Member 4 | Notifications       | `feature/notifications` | `lib/email.ts`, `app/api/notifications/`, `emails/` |
| Member 5 | Admin + Analytics   | `feature/admin`       | `app/admin/`, `app/api/admin/`, `components/charts/` |

---

## Git Workflow

```bash
# Switch to your branch
git checkout feature/your-module

# Pull latest from main before starting
git pull origin main

# Work on your files only
# Never edit files owned by another module

# Push your work
git push origin feature/your-module

# Lead merges all branches into main
```

---

## Shared Files (everyone uses, Lead owns)

- `lib/prisma.ts` — database client
- `lib/utils.ts` — cn() utility for Tailwind
- `types/index.ts` — shared TypeScript types
- `prisma/schema.prisma` — database schema
- `components/ui/` — shared UI components (Button, Input, Card, Label)

---

## Environment Variables

Ask the Lead for the `.env` file. Never commit `.env` to git.

---

## Rules

1. All times stored in **UTC** always
2. All API keys in `.env` only — never hardcode
3. All AI calls wrapped in `try/catch`
4. Feature branches only — **never push to main**
5. Tailwind CSS only for styling
6. Mobile first design always
7. Input validation on all forms
8. Loading states on all buttons

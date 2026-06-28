# Feature Specification: User Email Preferences & In-App Notifications

This document outlines the implementation roadmap for adding a cohesive email preference and in-app notification center.

## 1. Database Schema Additions (Prisma)

### File: `prisma/schema.prisma`

**New Enum: `ReminderTiming`**
```prisma
enum ReminderTiming {
  MIN_15
  HOUR_1
  HOURS_24
  BOTH
}
```

**New Enum: `NotificationType`**
```prisma
enum NotificationType {
  BOOKING_CREATED
  BOOKING_CANCELLED
  BOOKING_RESCHEDULED
}
```

**New Model: `UserPreference`** (Or extend existing `User`)
```prisma
model UserPreference {
  id                String         @id @default(cuid())
  userId            String         @unique
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  emailOnBooking    Boolean        @default(true)
  emailOnCancel     Boolean        @default(true)
  emailOnReschedule Boolean        @default(true)
  emailReminder     Boolean        @default(true)
  reminderTiming    ReminderTiming @default(HOURS_24)

  @@map("user_preferences")
}
```

**New Model: `Notification`**
```prisma
model Notification {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        NotificationType
  title       String
  message     String           @db.Text
  link        String?
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now())

  @@index([userId, isRead]) // Fast queries for unread count
  @@map("notifications")
}
```

---

## 2. API Contracts & Backend Logic

### User Preferences APIs
**File Path**: `app/api/user/preferences/route.ts`
- `GET /api/user/preferences`: 
  - **Response**: `{ success: true, data: UserPreference }`
- `PUT /api/user/preferences`: 
  - **Body**: `{ emailOnBooking, emailOnCancel, emailOnReschedule, emailReminder, reminderTiming }`
  - **Response**: `{ success: true, data: UserPreference }`

### Notification APIs
**File Path**: `app/api/notifications/route.ts`
- `GET /api/notifications`
  - **Query Params**: `?limit=10&offset=0&unreadOnly=true`
  - **Response**: `{ success: true, data: Notification[], unreadCount: number }`

**File Path**: `app/api/notifications/read/route.ts`
- `PUT /api/notifications/read`
  - **Body**: `{ notificationId: string }`
  - **Response**: `{ success: true }`

**File Path**: `app/api/notifications/read-all/route.ts`
- `PUT /api/notifications/read-all`
  - **Body**: Empty
  - **Response**: `{ success: true }`

### Existing Backend Integrations
- **Booking Creation (`POST /api/booking`)**: Add logic to check `UserPreference` before sending host email, and write a `BOOKING_CREATED` notification record.
- **Cancel/Reschedule (`POST /api/notifications/cancel` & `POST /api/notifications/reschedule`)**: Add logic to conditionally send host emails based on preferences and write `BOOKING_CANCELLED` / `BOOKING_RESCHEDULED` notification records.

---

## 3. Frontend Implementation Paths

### Task 3: User Preferences Page
**File Path**: `app/dashboard/settings/notifications/page.tsx`
- **Layout**: Uses a Card component ("Email Notifications").
- **Components**:
  - `Switch` (from `shadcn/ui`) for `emailOnBooking`, `emailOnCancel`, `emailOnReschedule`, and `emailReminder`.
  - `Select` (from `shadcn/ui`) for `reminderTiming`. Disabled/greyed out if `emailReminder` is false.
- **State Management**: Uses `react-hook-form` or `useState`. On submit, calls `PUT /api/user/preferences` and triggers a toast.

### Task 4 & 5: In-App Notification Center & Polling
**File Path**: `components/dashboard/NotificationBell.tsx` (New component to insert into `DashboardNav.tsx`)
- **Bell Icon**: Lucide `Bell` icon with a dynamic red badge for `unreadCount`.
- **Popover**: Using `shadcn/ui` Popover (width ~380px).
- **Header**: "Notifications" with a "Mark all as read" button.
- **List**: Maps up to 5 recent notifications. A blue dot indicates `isRead: false`. Empty state displays "All caught up! 🎉".
- **Interaction**: Clicking a notification hits `PUT /api/notifications/read` and routes to `link` (if available).
- **Polling**: Implement a `setInterval` or use SWR/React Query to refetch the `/api/notifications?unreadOnly=true` endpoint every 30 seconds for real-time updates.

// app/dashboard/notifications/page.tsx
// Notifications — dedicated full page (blue themed).
// Lists all booking CRUD and event-type CRUD activity.
// Auth is enforced by the dashboard layout. Owned by: Lead

import { NotificationsClient } from "@/components/dashboard/NotificationsClient";

export default function NotificationsPage() {
  return <NotificationsClient />;
}

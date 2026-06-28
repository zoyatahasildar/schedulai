// app/dashboard/event-types/new/page.tsx
// Redirects to the Event Types page and opens the New Event Type modal.
// (The old standalone form is replaced by the in-page modal.)
// Owned by: Lead

import { redirect } from "next/navigation";

export default function NewEventTypePage() {
  redirect("/dashboard/event-types?new=1");
}

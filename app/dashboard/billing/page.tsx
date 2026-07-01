// app/dashboard/billing/page.tsx
// Billing & Subscription — dedicated full page.
// Auth is enforced by the dashboard layout. Owned by: Lead

import { BillingClient } from "@/components/dashboard/BillingClient";

export default function BillingPage() {
  return <BillingClient />;
}

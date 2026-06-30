// components/Providers.tsx
// Wraps the app with SessionProvider for NextAuth + TimezoneProvider for the
// user's display timezone preference.
// Owned by: Lead

"use client";

import { SessionProvider } from "next-auth/react";
import { TimezoneProvider } from "@/components/providers/TimezoneProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>{children}</TimezoneProvider>
    </SessionProvider>
  );
}

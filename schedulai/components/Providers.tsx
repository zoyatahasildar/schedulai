// components/Providers.tsx
// Wraps the app with SessionProvider for NextAuth
// Owned by: Lead

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

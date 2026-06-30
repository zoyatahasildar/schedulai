// components/providers/TimezoneProvider.tsx
// Global timezone preference for the app (display-only).
// All booking data stays in UTC in the database — this context only changes
// how dates/times are *shown* to the signed-in user.
// Owned by: Member 4 (Notifications & Email)
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "chronoai.timezone";

// A small fallback list used only if the runtime lacks Intl.supportedValuesOf.
const FALLBACK_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function supportedTimeZones(): string[] {
  try {
    const fn = (Intl as any).supportedValuesOf;
    if (typeof fn === "function") {
      const zones = fn("timeZone") as string[];
      if (Array.isArray(zones) && zones.length) return zones;
    }
  } catch {
    /* fall through to fallback */
  }
  return FALLBACK_ZONES;
}

type TimezoneContextValue = {
  /** The user's chosen IANA timezone (e.g. "Asia/Kolkata"). */
  timezone: string;
  /** Update + persist the chosen timezone. */
  setTimezone: (tz: string) => void;
  /** True once the value has been read from localStorage on the client. */
  hydrated: boolean;
  /** Format any date in the chosen timezone. Storage stays UTC; this is display-only. */
  formatInTimeZone: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => string;
};

const TimezoneContext = createContext<TimezoneContextValue | null>(null);

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  // Start from a stable value so the server render and first client render match,
  // then sync to the persisted / browser value after mount (avoids hydration mismatch).
  const [timezone, setTimezoneState] = useState<string>("UTC");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initial = browserTimeZone();
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) initial = stored;
    } catch {
      /* localStorage unavailable — keep browser/UTC default */
    }
    setTimezoneState(initial);
    setHydrated(true);
  }, []);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
    try {
      window.localStorage.setItem(STORAGE_KEY, tz);
    } catch {
      /* ignore persistence errors */
    }
  }, []);

  const formatInTimeZone = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const d = date instanceof Date ? date : new Date(date);
      try {
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          ...options,
          timeZone: timezone,
        }).format(d);
      } catch {
        // Invalid/unsupported timezone — fall back to UTC so we never crash a render.
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          ...options,
          timeZone: "UTC",
        }).format(d);
      }
    },
    [timezone]
  );

  return (
    <TimezoneContext.Provider
      value={{ timezone, setTimezone, hydrated, formatInTimeZone }}
    >
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone(): TimezoneContextValue {
  const ctx = useContext(TimezoneContext);
  if (!ctx) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return ctx;
}

// types/index.ts
// Shared TypeScript types — used by ALL team members
// Import from here: import type { ... } from "@/types"

import type { User, EventType, Booking, Availability, BookingStatus } from "@prisma/client";

// ─── RE-EXPORT PRISMA TYPES ────────────────────────────
export type { User, EventType, Booking, Availability, BookingStatus };

// ─── EXTENDED TYPES ────────────────────────────────────

// EventType with its owner
export type EventTypeWithUser = EventType & {
  user: Pick<User, "id" | "name" | "username" | "image">;
};

// Booking with its event type
export type BookingWithEventType = Booking & {
  eventType: EventType & {
    user: Pick<User, "id" | "name" | "email" | "username">;
  };
};

// Available time slot (used by Member 3 → Member 2)
export type TimeSlot = {
  startTime: Date;
  endTime: Date;
  available: boolean;
};

// ─── API RESPONSE TYPES ────────────────────────────────
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─── NEXTAUTH SESSION EXTENSION ───────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string | null;
  }
}

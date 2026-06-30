// app/api/user/preferences/route.ts
// User Preferences API — fetch and update preferences for the logged-in user
// ═══════════════════════════════════════════════
// GET /api/user/preferences → return current user's preferences (upserts defaults on first call)
// PUT /api/user/preferences → update one or more preference fields
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fields callers are allowed to update (whitelist prevents mass-assignment)
const ALLOWED_FIELDS = new Set([
  // Notification preferences
  "emailOnBooking",
  "emailOnCancel",
  "emailOnReschedule",
  "emailReminder",
  "reminderTiming",
  // Appearance preferences
  "dashboardTheme",
  "bookingTheme",
  "bookingLayout",
  "brandColorLight",
  "brandColorDark",
]);

const VALID_THEMES = new Set(["system", "light", "dark"]);
const VALID_LAYOUTS = new Set(["month", "week", "day"]);
const VALID_TIMINGS = new Set(["MIN_15", "HOUR_1", "HOURS_24", "BOTH"]);
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// GET: Fetch preferences for the authenticated user
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // upsert so the row is always present (first-time users get clean defaults)
    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error("Fetch preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT: Update preferences for the authenticated user
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // ─── Build sanitized update payload ─────────────────
    const data: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_FIELDS.has(key)) continue; // silently ignore unknown keys

      // Per-field validation
      if (key === "dashboardTheme" || key === "bookingTheme") {
        if (typeof value !== "string" || !VALID_THEMES.has(value)) {
          return NextResponse.json(
            { success: false, error: `Invalid value for ${key}. Must be one of: system, light, dark` },
            { status: 400 }
          );
        }
      }

      if (key === "bookingLayout") {
        if (typeof value !== "string" || !VALID_LAYOUTS.has(value)) {
          return NextResponse.json(
            { success: false, error: "Invalid bookingLayout. Must be one of: month, week, day" },
            { status: 400 }
          );
        }
      }

      if (key === "brandColorLight" || key === "brandColorDark") {
        if (typeof value !== "string" || !HEX_COLOR_RE.test(value)) {
          return NextResponse.json(
            { success: false, error: `Invalid hex color for ${key}` },
            { status: 400 }
          );
        }
      }

      if (key === "reminderTiming") {
        if (typeof value !== "string" || !VALID_TIMINGS.has(value)) {
          return NextResponse.json(
            { success: false, error: "Invalid reminderTiming. Must be one of: MIN_15, HOUR_1, HOURS_24, BOTH" },
            { status: 400 }
          );
        }
      }

      if (
        key === "emailOnBooking" ||
        key === "emailOnCancel" ||
        key === "emailOnReschedule" ||
        key === "emailReminder"
      ) {
        if (typeof value !== "boolean") {
          return NextResponse.json(
            { success: false, error: `${key} must be a boolean` },
            { status: 400 }
          );
        }
      }

      data[key] = value;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided" },
        { status: 400 }
      );
    }

    // upsert so PUT works even if the row hasn't been created yet
    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { userId: session.user.id, ...data },
    });

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

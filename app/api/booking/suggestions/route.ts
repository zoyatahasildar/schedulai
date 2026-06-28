// app/api/booking/suggestions/route.ts
// Gemini AI booking-time suggestions
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// GET /api/booking/suggestions?eventTypeId=xxx
//   - Analyzes the host's historical booking patterns (weekday + hour, UTC)
//   - Asks Gemini (free gemini-1.5-flash) to recommend the best times to book
//   - Falls back to a deterministic heuristic if AI is unavailable
//   - All AI calls wrapped in try/catch (team rule #3)
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 ? "AM" : "PM";
  return `${h12}:00 ${period} UTC`;
}

// Pick the top N entries from a frequency map
function topEntries(counts: Record<string, number>, n: number): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventTypeId = searchParams.get("eventTypeId");

    if (!eventTypeId) {
      return NextResponse.json(
        { success: false, error: "eventTypeId is required" },
        { status: 400 }
      );
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: "Event type not found" },
        { status: 404 }
      );
    }

    // ─── Gather the host's booking history ──────────────
    const bookings = await prisma.booking.findMany({
      where: {
        eventType: { userId: eventType.userId },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { startTime: true },
      orderBy: { startTime: "desc" },
      take: 200,
    });

    // Host availability windows give us a sensible fallback
    const availability = await prisma.availability.findMany({
      where: { userId: eventType.userId, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    });

    const dayCounts: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};
    for (const b of bookings) {
      const wd = DAYS[b.startTime.getUTCDay()];
      const hr = formatHour(b.startTime.getUTCHours());
      dayCounts[wd] = (dayCounts[wd] ?? 0) + 1;
      hourCounts[hr] = (hourCounts[hr] ?? 0) + 1;
    }

    const topDays = topEntries(dayCounts, 2);
    const topHours = topEntries(hourCounts, 3);

    // ─── Deterministic heuristic fallback ───────────────
    const heuristic = buildHeuristic(topDays, topHours, availability);

    // ─── Try Gemini for nicer, natural-language suggestions
    const aiSuggestions = await tryGemini(eventType.title, bookings.length, topDays, topHours, availability);

    const suggestions = aiSuggestions.length > 0 ? aiSuggestions : heuristic;

    return NextResponse.json({
      success: true,
      data: {
        source: aiSuggestions.length > 0 ? "ai" : "heuristic",
        suggestions,
      },
    });
  } catch (error) {
    console.error("Suggestions API error:", error);
    // Never break the booking page over a suggestion failure
    return NextResponse.json({ success: true, data: { source: "none", suggestions: [] } });
  }
}

function buildHeuristic(
  topDays: string[],
  topHours: string[],
  availability: { dayOfWeek: number; startTime: string }[]
): string[] {
  const out: string[] = [];
  if (topDays.length && topHours.length) {
    out.push(`${topDays[0]} around ${topHours[0]} tends to be popular`);
    if (topHours[1]) out.push(`${topDays[topDays.length > 1 ? 1 : 0]} at ${topHours[1]} is often a good fit`);
  }
  // Fill from availability if we don't have enough history
  for (const a of availability) {
    if (out.length >= 3) break;
    out.push(`${DAYS[a.dayOfWeek]} from ${a.startTime} UTC is open`);
  }
  return out.slice(0, 3);
}

async function tryGemini(
  eventTitle: string,
  historyCount: number,
  topDays: string[],
  topHours: string[],
  availability: { dayOfWeek: number; startTime: string; endTime: string }[]
): Promise<string[]> {
  try {
    if (!process.env.GEMINI_API_KEY) return [];
    if (historyCount === 0 && availability.length === 0) return [];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const availabilityText = availability
      .map((a) => `${DAYS[a.dayOfWeek]} ${a.startTime}-${a.endTime} UTC`)
      .join(", ");

    const prompt = `You are a scheduling assistant for a "${eventTitle}" meeting.
Based on the host's booking history and availability, suggest the 3 best times for a guest to book.

Booking history (${historyCount} past bookings):
- Most popular days: ${topDays.join(", ") || "none yet"}
- Most popular hours: ${topHours.join(", ") || "none yet"}
Host weekly availability (UTC): ${availabilityText || "not set"}

Rules:
- Return exactly 3 short suggestions, one per line.
- Each line ≤ 12 words, friendly, mentioning a day and a time in UTC.
- No numbering, no markdown, no extra commentary.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text
      .split("\n")
      .map((l) => l.replace(/^[\s\-*•\d.)]+/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, 3);
  } catch (err) {
    console.error("Gemini suggestion generation failed, using fallback:", err);
    return [];
  }
}

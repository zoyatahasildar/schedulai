// app/api/chatbot/route.ts
// AI Chatbot API — powered by Google Gemini
// Owned by: Lead ⭐ STAR FEATURE

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, username } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch host info if username provided (for context-aware responses)
    let hostContext = "";
    if (username) {
      try {
        const host = await prisma.user.findUnique({
          where: { username },
          include: {
            eventTypes: { where: { isActive: true } },
            availability: { where: { isActive: true } },
          },
        });

        if (host) {
          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const availabilityText = host.availability
            .map((a) => `${days[a.dayOfWeek]}: ${a.startTime} - ${a.endTime} UTC`)
            .join(", ");

          const eventTypesText = host.eventTypes
            .map((e) => `${e.title} (${e.duration} min${e.price > 0 ? `, $${e.price}` : ", free"})`)
            .join(", ");

          hostContext = `
You are helping users book meetings with ${host.name}.
Their available event types: ${eventTypesText || "None set yet"}.
Their weekly availability: ${availabilityText || "Not set yet"}.
Their booking link: ${process.env.NEXT_PUBLIC_APP_URL}/book/${username}
          `;
        }
      } catch (err) {
        console.error("Error fetching host context:", err);
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const systemPrompt = `
You are ChronoAI, a friendly and helpful AI scheduling assistant for a booking platform similar to Cal.com.

${hostContext}

You help users with:
- Finding available time slots
- Booking meetings
- Cancelling or rescheduling bookings
- Understanding meeting types and durations
- Navigating the scheduling platform

Rules:
- Be concise and friendly (2-3 sentences max per response)
- Always guide users to take action (book, check availability, etc.)
- If asked to book, direct them to the booking page
- Use emojis sparingly to be friendly
- Never make up specific times — always check actual availability
- If you don't know something, admit it and guide them to the right place
    `.trim();

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = result.response.text();

    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "AI assistant is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

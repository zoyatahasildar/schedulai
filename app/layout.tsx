// app/layout.tsx
// Root layout — wraps all pages
// Owned by: Lead

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScheduleAI — Smart Scheduling, Powered by AI",
  description:
    "Schedule meetings effortlessly with AI-powered smart scheduling. Share your booking link, set your availability, and let ScheduleAI handle the rest.",
  keywords: ["scheduling", "calendar", "booking", "AI", "meetings"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className={jakarta.className}>
        <Providers>
          {children}
          {/* AI Chatbot — visible on every page */}
          <ChatbotButton />
        </Providers>
      </body>
    </html>
  );
}

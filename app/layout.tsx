// app/layout.tsx
// Root layout — wraps all pages
// Owned by: Lead

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChronoAI — Smart Scheduling, Powered by AI",
  description:
    "Schedule meetings effortlessly with AI-powered smart scheduling. Share your booking link, set your availability, and let ChronoAI handle the rest.",
  keywords: ["scheduling", "calendar", "booking", "AI", "meetings"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* AI Chatbot — visible on every page */}
          <ChatbotButton />
        </Providers>
      </body>
    </html>
  );
}

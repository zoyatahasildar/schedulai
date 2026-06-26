// components/chatbot/ChatbotButton.tsx
// Floating chatbot button — appears on every page
// Owned by: Lead ⭐ STAR FEATURE

"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatbotWindow } from "./ChatbotWindow";
import { usePathname } from "next/navigation";

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Extract username from booking page for context
  const username = pathname.startsWith("/book/")
    ? pathname.split("/book/")[1]?.split("/")[0]
    : undefined;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatbotWindow
          onClose={() => setIsOpen(false)}
          username={username}
        />
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg hover:shadow-violet-300 transition-all flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}

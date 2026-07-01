// components/chatbot/ChatbotWindow.tsx
// AI Chat window UI
// Owned by: Lead ⭐ STAR FEATURE

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotWindowProps {
  onClose: () => void;
  username?: string;
}

const QUICK_PROMPTS = [
  "When are you free?",
  "Book a 30 min call",
  "What meeting types are available?",
  "Cancel my booking",
];

export function ChatbotWindow({ onClose, username }: ChatbotWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your EdOra assistant 👋 I can help you book meetings, check availability, and more. What can I help you with?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, username }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || data.error || "Sorry, I couldn't process that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-violet-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">EdOra Assistant</p>
          <p className="text-violet-200 text-xs">Scheduling made simple</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" title="Online" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-violet-100"
                  : "bg-gray-200"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4 text-violet-600" />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div
              className={`max-w-xs px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-gray-100 text-gray-800 rounded-tl-none"
                  : "bg-violet-600 text-white rounded-tr-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-600" />
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-full hover:bg-violet-100 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask me anything..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-violet-600 text-white rounded-lg flex items-center justify-center hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

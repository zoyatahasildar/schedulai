// components/booking/AISuggestions.tsx
// Gemini-powered "best times" hints for the public booking flow (client)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// ═══════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface AISuggestionsProps {
  eventTypeId: string;
}

export function AISuggestions({ eventTypeId }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/booking/suggestions?eventTypeId=${eventTypeId}`
        );
        const json = await res.json();
        if (active && res.ok && json.success && Array.isArray(json.data?.suggestions)) {
          setSuggestions(json.data.suggestions.slice(0, 3));
        }
      } catch {
        // Non-critical feature — fail silently
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [eventTypeId]);

  // Hide entirely if there's nothing useful to show
  if (loading || suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <p className="text-sm font-semibold text-violet-700">AI-suggested times</p>
      </div>
      <ul className="space-y-1">
        {suggestions.map((s, i) => (
          <li key={i} className="text-sm text-gray-600">
            • {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

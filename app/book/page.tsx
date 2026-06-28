// app/book/page.tsx
// Booking index — public landing for the /book route.
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// NOTE: The per-host booking page lives at /book/[username] and the booking
// flow at /book/[username]/[eventId]. This index previously referenced
// `params.username` while sitting at the static /book route (no dynamic
// segment), which was a routing defect — it has been corrected here.
// ═══════════════════════════════════════════════

import Link from "next/link";
import { Calendar } from "lucide-react";

export default function BookIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book a meeting</h1>
        <p className="text-gray-500 mb-6">
          To book time with someone, open their personal booking link — it looks
          like <span className="font-mono text-violet-600">/book/their-username</span>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-violet-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

// app/admin/page.tsx
// Admin analytics dashboard
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// Branch: feature/admin
// ═══════════════════════════════════════════════
// TODO Member 5:
// 1. Fetch total bookings, confirmed, cancelled counts
// 2. Bookings per day chart (last 30 days)
// 3. Popular event types chart
// 4. AI weekly summary using Gemini
// 5. Export bookings as CSV
// ═══════════════════════════════════════════════

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Basic stats — Member 5: enhance these
  const [total, confirmed, cancelled, pending] = await Promise.all([
    prisma.booking.count({ where: { eventType: { userId: session.user.id } } }),
    prisma.booking.count({ where: { eventType: { userId: session.user.id }, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { eventType: { userId: session.user.id }, status: "CANCELLED" } }),
    prisma.booking.count({ where: { eventType: { userId: session.user.id }, status: "PENDING" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        {/* Stats — Member 5: replace with proper Chart components */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Bookings", value: total, color: "violet" },
            { label: "Confirmed", value: confirmed, color: "green" },
            { label: "Pending", value: pending, color: "yellow" },
            { label: "Cancelled", value: cancelled, color: "red" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-sm border">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Placeholder for charts — Member 5 replaces these */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border h-64 flex items-center justify-center">
            <p className="text-gray-400">📊 Bookings Over Time Chart<br />(Member 5 implements this)</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border h-64 flex items-center justify-center">
            <p className="text-gray-400">🥧 Popular Event Types Chart<br />(Member 5 implements this)</p>
          </div>
        </div>

        {/* AI Weekly Summary placeholder */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6 mt-6">
          <h2 className="font-semibold text-violet-700 mb-2">🤖 AI Weekly Summary</h2>
          <p className="text-gray-500 text-sm">(Member 5: Generate this using Gemini AI)</p>
        </div>
      </div>
    </div>
  );
}

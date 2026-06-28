// app/admin/mockData.ts
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 5 (Admin + Analytics module)
// ═══════════════════════════════════════════════
// Static MOCK data for the Admin Dashboard UI.
// No database, no Prisma, no API — pure in-file data.
// Swap these exports for live /api/admin/* data later.
// ═══════════════════════════════════════════════

// ─── STAT CARDS ────────────────────────────────────────
export interface StatCard {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export const statCards: StatCard[] = [
  { id: "total-bookings", label: "Total Bookings", value: "1,248", hint: "All time" },
  { id: "monthly-bookings", label: "Monthly Bookings", value: "320", hint: "This month" },
  { id: "revenue", label: "Revenue", value: "$12,480", hint: "This month" },
  {
    id: "popular-event",
    label: "Most Popular Event Type",
    value: "30 Min Intro Call",
    hint: "412 bookings",
  },
];

// ─── WEEKLY BOOKINGS (BAR CHART) ───────────────────────
export interface WeeklyBookingPoint {
  day: string;
  bookings: number;
}

export const weeklyBookings: WeeklyBookingPoint[] = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 18 },
  { day: "Wed", bookings: 15 },
  { day: "Thu", bookings: 22 },
  { day: "Fri", bookings: 14 },
  { day: "Sat", bookings: 4 },
  { day: "Sun", bookings: 2 },
];

// ─── BOOKING STATUS (PIE CHART) ────────────────────────
// `name` / `value` keys match Recharts' default Pie accessors.
export interface BookingStatusSlice {
  name: string;
  value: number;
  color: string;
}

export const bookingStatus: BookingStatusSlice[] = [
  { name: "Confirmed", value: 642, color: "#16a34a" },
  { name: "Pending", value: 318, color: "#eab308" },
  { name: "Completed", value: 214, color: "#7c3aed" },
  { name: "Cancelled", value: 74, color: "#ef4444" },
];

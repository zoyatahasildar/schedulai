// app/dashboard/availability/page.tsx
// 🔒 OWNED BY: Member 3 (Calendar + Timezone module)

import AvailabilityPicker from "@/components/calendar/AvailabilityPicker";

export default function AvailabilityPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the hours you are available for bookings each week.
        </p>
      </div>
      <AvailabilityPicker />
    </div>
  );
}

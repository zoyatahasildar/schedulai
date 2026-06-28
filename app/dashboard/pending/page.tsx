// app/dashboard/pending/page.tsx
// Pending Requests section (host dashboard)
// ═══════════════════════════════════════════════
// 🔒 OWNED BY: Member 2 (Booking Engine)
// Branch: feature/booking
// ═══════════════════════════════════════════════
// Lists booking requests awaiting the host's approval and lets them
// accept / reject each one. Self-contained: it does not modify the
// Lead-owned dashboard nav or bookings views.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PendingRequestsClient } from "@/components/booking/PendingRequestsClient";

// Counts must be live — never cache this page.
export const dynamic = "force-dynamic";

export default async function PendingRequestsPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const [pending, confirmedCount] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "PENDING", eventType: { userId: user.id } },
      include: { eventType: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({
      where: { status: "CONFIRMED", eventType: { userId: user.id } },
    }),
  ]);

  const requests = pending.map((b) => ({
    id: b.id,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    guestPhone: b.guestPhone,
    eventTitle: b.eventType.title,
    duration: b.eventType.duration,
    price: b.eventType.price,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    message: b.notes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <PendingRequestsClient
      initialRequests={requests}
      confirmedCount={confirmedCount}
    />
  );
}

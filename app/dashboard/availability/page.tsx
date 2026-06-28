// app/dashboard/availability/page.tsx
// Availability — real weekly schedule editor, ChronoAI design
// Owned by: Lead / Member 3

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AvailabilityClient } from "@/components/dashboard/AvailabilityClient";

export default async function AvailabilityPage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const availability = await prisma.availability.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { dayOfWeek: "asc" },
  });

  const data = availability.map((a) => ({
    dayOfWeek: a.dayOfWeek,
    startTime: a.startTime,
    endTime: a.endTime,
  }));

  // Always include today so the user can see and confirm today's availability
  const todayDow = new Date().getDay();
  const hasToday = data.some((d) => d.dayOfWeek === todayDow);
  if (!hasToday) {
    data.push({ dayOfWeek: todayDow, startTime: "09:00", endTime: "17:00" });
  }

  return <AvailabilityClient initial={data} />;
}

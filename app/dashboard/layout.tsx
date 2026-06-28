// app/dashboard/layout.tsx
// Protected layout — sidebar shell (dark redesign)
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#0b1020]">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

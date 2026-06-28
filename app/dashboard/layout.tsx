// app/dashboard/layout.tsx
// Protected layout — only authenticated users can access
// Owned by: Lead

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";

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
    <div className="min-h-screen bg-[#E8EDF4]">
      <DashboardNav user={session.user} />
      <main>{children}</main>
    </div>
  );
}

// components/DashboardNav.tsx
// Dashboard top navigation — ScheduleAI design, with in-app notification bell
// Owned by: Lead

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Zap, LayoutDashboard, CalendarDays, BookOpen, Clock, BarChart3, Settings, LogOut,
} from "lucide-react";
import Image from "next/image";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

interface DashboardNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/event-types", label: "Event Types", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Bookings", icon: BookOpen },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function initials(name?: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-md shadow-[#6C63FF]/30">
            <Zap className="w-4 h-4 text-white fill-white" />
          </span>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            Schedule<span className="text-[#6C63FF]">AI</span>
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-4 text-[13px] font-medium transition-all duration-150 ${
                  isActive ? "text-[#6C63FF]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.75} />
                <span className="hidden md:inline">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — notifications + user + logout */}
        <div className="flex items-center gap-1.5">
          <NotificationBell />

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "User"} width={32} height={32} className="rounded-full" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
                {initials(user.name)}
              </span>
            )}
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold text-gray-800 leading-tight">{user.name ?? "Your account"}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Free plan</p>
            </div>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Log out"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

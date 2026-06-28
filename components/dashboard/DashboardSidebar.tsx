// components/dashboard/DashboardSidebar.tsx
// Vertical dark sidebar navigation
// Owned by: Lead
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Zap, LayoutDashboard, CalendarDays, BookOpen, Clock, BarChart3, Settings, LogOut,
} from "lucide-react";
import Image from "next/image";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const NAV = [
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

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] flex-shrink-0 bg-[#0d1326] border-r border-white/5 sticky top-0 self-start h-screen flex flex-col p-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-7">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-md shadow-[#6C63FF]/30">
          <Zap className="w-4 h-4 text-white fill-white" />
        </span>
        <span className="text-[15px] font-bold text-white">Schedule<span className="text-[#6C63FF]">AI</span></span>
      </Link>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#1e3a5f] text-white"
                  : "text-white/55 hover:bg-[#2b6cb0]/30 hover:text-white"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? "User"} width={32} height={32} className="rounded-full" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-white text-[12px] font-bold">
              {initials(user.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white leading-tight truncate">{user.name ?? "Your account"}</p>
            <p className="text-[10px] text-white/40 leading-tight">Free plan</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-white/55 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" /> Log out
        </button>
      </div>
    </aside>
  );
}

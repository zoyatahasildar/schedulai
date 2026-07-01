// components/dashboard/DashboardSidebar.tsx
// Vertical dark sidebar navigation. Notifications is now a nav link
// (opens /dashboard/notifications) with a live unread count badge.
// Owned by: Lead
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Zap, LayoutDashboard, CalendarDays, BookOpen, Clock, BarChart3, Settings, LogOut, Bell
} from "lucide-react";
import Image from "next/image";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const NOTIF_HREF = "/dashboard/notifications";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/event-types", label: "Event Types", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Bookings", icon: BookOpen },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: NOTIF_HREF, label: "Notifications", icon: Bell },
];

const SETTINGS_NAV = { href: "/dashboard/settings", label: "Settings", icon: Settings };

function initials(name?: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);

  // Poll the notification feed just to drive the badge count on the nav item.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/notifications/feed")
        .then((r) => (r.ok ? r.json() : { bookings: [], events: [] }))
        .then((d) => {
          if (!cancelled) {
            const count = (d.bookings?.length ?? 0) + (d.events?.length ?? 0);
            setNotifCount(count);
          }
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  return (
    <aside className="w-[300px] flex-shrink-0 bg-[#0d1326] border-r border-white/5 sticky top-0 self-start h-screen flex flex-col p-4 overflow-hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-4 flex-shrink-0">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-md shadow-[#6C63FF]/30">
          <Zap className="w-4 h-4 text-white fill-white" />
        </span>
        <span className="text-[15px] font-bold text-white">Schedule<span className="text-[#6C63FF]">AI</span></span>
      </Link>

      {/* Nav */}
      <nav className="space-y-1 flex-shrink-0">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isNotif = href === NOTIF_HREF;
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
              <span className="flex-1">{label}</span>
              {isNotif && notifCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spacer pushes settings + user block to the bottom */}
      <div className="flex-1 min-h-0" />

      {/* Settings */}
      <div className="flex-shrink-0 border-t border-white/5 pt-3 mb-3">
        <Link
          href={SETTINGS_NAV.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
            pathname === SETTINGS_NAV.href
              ? "bg-[#1e3a5f] text-white"
              : "text-white/55 hover:bg-[#2b6cb0]/30 hover:text-white"
          }`}
        >
          <SETTINGS_NAV.icon className="w-[18px] h-[18px]" strokeWidth={pathname === SETTINGS_NAV.href ? 2 : 1.75} />
          {SETTINGS_NAV.label}
        </Link>
      </div>

      {/* User + logout */}
      <div className="flex-shrink-0 pt-3 border-t border-white/5">
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
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-white/55 hover:bg-red-500/20 hover:text-red-300 transition-colors text-left"
        >
          <LogOut className="w-[18px] h-[18px]" /> Log out
        </button>
      </div>
    </aside>
  );
}

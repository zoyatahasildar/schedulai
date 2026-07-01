// components/dashboard/DashboardSidebar.tsx
// Vertical dark sidebar navigation. Notifications is now a nav link
// (opens /dashboard/notifications) with a live unread count badge.
// Owned by: Lead
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import {
  Zap, LayoutDashboard, CalendarDays, BookOpen, Clock, BarChart3, Settings, LogOut, Bell,
  CheckCircle2, XCircle, Calendar, Plus, X, Pencil, EyeOff, CreditCard
} from "lucide-react";
import { useBillingStore } from "@/store/billingStore";
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
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: NOTIF_HREF, label: "Notifications", icon: Bell },
];

const SETTINGS_NAV = { href: "/dashboard/settings", label: "Settings", icon: Settings };

function initials(name?: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free plan", color: "text-white/40" },
  pro: { label: "Pro plan", color: "text-[#6C63FF]" },
  promax: { label: "Pro Max plan", color: "text-[#00D4FF]" },
};

function PlanLabel() {
  const plan = useBillingStore((s) => s.currentPlan);
  const info = PLAN_LABELS[plan] ?? PLAN_LABELS.free;
  return <p className={`text-[10px] leading-tight font-medium ${info.color}`}>{info.label}</p>;
}

const POPUP_ICONS = {
  new: CheckCircle2,
  pending: Clock,
  completed: Calendar,
  cancelled: XCircle,
  event_created: Plus,
  event_updated: Pencil,
  event_deactivated: EyeOff,
} as const;

const POPUP_COLORS = {
  new: "#10B981",
  pending: "#F59E0B",
  completed: "#6C63FF",
  cancelled: "#EF4444",
  event_created: "#10B981",
  event_updated: "#00B5CC",
  event_deactivated: "#94A3B8",
} as const;

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);
  const [activePopup, setActivePopup] = useState<any | null>(null);
  const lastMaxTimeRef = useRef<number>(0);

  useEffect(() => {
    if (activePopup) {
      const t = setTimeout(() => setActivePopup(null), 6000);
      return () => clearTimeout(t);
    }
  }, [activePopup]);

  // Poll the notification feed just to drive the badge count on the nav item and trigger popups.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (pathname === NOTIF_HREF) {
        setNotifCount(0);
        return;
      }

      const seen = Number(localStorage.getItem("chronoai_notif_seen") || 0);

      fetch("/api/notifications/feed")
        .then((r) => (r.ok ? r.json() : { bookings: [], events: [] }))
        .then((d) => {
          if (!cancelled) {
            const allItems = [...(d.bookings ?? []), ...(d.events ?? [])];
            
            // Check for new notifications to trigger the popup
            const times = allItems.map((n) => new Date(n.at).getTime());
            const maxTime = times.length > 0 ? Math.max(...times) : Date.now();

            if (lastMaxTimeRef.current === 0) {
              lastMaxTimeRef.current = maxTime;
            } else {
              const newNotifs = allItems.filter(
                (n) => new Date(n.at).getTime() > lastMaxTimeRef.current
              );
              if (newNotifs.length > 0) {
                newNotifs.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
                setActivePopup(newNotifs[0]);
                lastMaxTimeRef.current = Math.max(...newNotifs.map((n) => new Date(n.at).getTime()));
              }
            }

            // Calculate the sidebar badge count
            const unreadCount = allItems.filter(
              (n) => new Date(n.at).getTime() > seen
            ).length;
            setNotifCount(unreadCount);
          }
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, [pathname]);

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
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0 animate-pulse" />
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
            <PlanLabel />
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-white/55 hover:bg-red-500/20 hover:text-red-300 transition-colors text-left"
        >
          <LogOut className="w-[18px] h-[18px]" /> Log out
        </button>
      </div>

      {/* Active Notification Popup */}
      {activePopup && (
        <div className="fixed top-6 right-6 z-[9999] w-80 bg-[#131a2e] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl p-4 flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
          {(() => {
            const Icon = POPUP_ICONS[activePopup.type as keyof typeof POPUP_ICONS] ?? CheckCircle2;
            const color = POPUP_COLORS[activePopup.type as keyof typeof POPUP_COLORS] ?? "#6C63FF";
            return (
              <>
                <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white/40 uppercase tracking-wider">New Activity</p>
                  <p className="text-[14px] font-bold text-white mt-0.5 leading-tight">{activePopup.title}</p>
                  <p className="text-[13px] text-white/60 mt-1 leading-snug">{activePopup.message}</p>
                </div>
                <button
                  onClick={() => setActivePopup(null)}
                  className="text-white/45 hover:text-white transition-colors flex-shrink-0 self-start p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            );
          })()}
        </div>
      )}
    </aside>
  );
}

// components/DashboardNav.tsx
// Dashboard navigation bar
// Owned by: Lead

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Calendar, Clock, Users, Settings, BarChart3, LogOut } from "lucide-react";
import Image from "next/image";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Calendar },
  { href: "/dashboard/event-types", label: "Event Types", icon: Clock },
  { href: "/dashboard/bookings", label: "Bookings", icon: Users },
  { href: "/dashboard/availability", label: "Availability", icon: Calendar },
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-violet-700">ChronoAI</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-600 hover:text-violet-600 hover:bg-violet-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="hidden sm:block text-sm text-gray-700 font-medium">
              {user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

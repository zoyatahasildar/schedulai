// components/PublicHeader.tsx
// Public navigation header with dynamic theme toggler
// Owned by: Lead (Appearance / Theme)

"use client";

import Link from "next/link";
import { useAppearanceStore } from "@/store/appearanceStore";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function PublicHeader() {
  const { dashboardTheme, set } = useAppearanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine current active theme
  const resolvedTheme =
    dashboardTheme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : dashboardTheme;

  const toggleTheme = async () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    set("dashboardTheme", nextTheme);
    localStorage.setItem("chronoai-public-theme", nextTheme);

    // Save to database if user is logged in
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardTheme: nextTheme }),
      });
    } catch (e) {
      // Ignore database save failure if guest
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#0b1020]/70 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center shadow-lg shadow-[#6c63ff]/30">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
            </svg>
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-[#1a1a2e] dark:text-white transition-colors duration-300">
            Chrono<span className="text-[#6c63ff]">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#1a1a2e]/70 dark:text-white/70">
          <Link href="/features" className="hover:text-[#6c63ff] dark:hover:text-[#00d4ff] transition">
            Features
          </Link>
          <Link href="/#how" className="hover:text-[#6c63ff] dark:hover:text-[#00d4ff] transition">
            How it works
          </Link>
          <Link href="/#social" className="hover:text-[#6c63ff] dark:hover:text-[#00d4ff] transition">
            Customers
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition text-[#1a1a2e] dark:text-white"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          <Link
            href="/login?mode=login"
            className="hidden sm:inline text-[14px] font-semibold text-[#1a1a2e]/70 dark:text-white/70 hover:text-[#1a1a2e] dark:hover:text-white transition"
          >
            Log in
          </Link>
          <Link
            href="/login?mode=signup"
            className="text-[14px] font-bold text-white bg-[#1a1a2e] dark:bg-white dark:text-[#1a1a2e] px-4 py-2 rounded-xl hover:bg-[#16213e] dark:hover:bg-white/95 transition shadow-sm"
          >
            Get Started Free
          </Link>
        </div>
      </nav>
    </header>
  );
}

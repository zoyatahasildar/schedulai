// components/PublicFooter.tsx
// Public footer component shared across landing and features pages
// Owned by: Lead (Appearance / Layout)

"use client";

import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 py-10 bg-white/10 dark:bg-[#0b1020]/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
            </svg>
          </span>
          <span className="font-extrabold text-[#1a1a2e] dark:text-white transition-colors duration-300">
            Chrono<span className="text-[#6c63ff]">AI</span>
          </span>
        </Link>
        <p className="text-[13px] text-[#1a1a2e]/45 dark:text-white/45 transition-colors duration-300">
          © 2026 ChronoAI · Smart Scheduling, Powered by AI
        </p>
        <div className="flex gap-5 text-[13px] text-[#1a1a2e]/50 dark:text-white/50 font-medium transition-colors duration-300">
          <a href="#" className="hover:text-[#6c63ff] transition">
            Privacy
          </a>
          <a href="#" className="hover:text-[#6c63ff] transition">
            Terms
          </a>
          <a href="#" className="hover:text-[#6c63ff] transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

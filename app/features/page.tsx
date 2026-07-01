// app/features/page.tsx
// Public features page — ChronoAI
// Owned by: Lead

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import FeatureCards from "@/components/FeatureCards";

export default function FeaturesPage() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".lp .reveal").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, []);

  return (
    <div className="public-page lp bg-[#fbfbfe] text-[#1a1a2e] dark:bg-[#0b1020] dark:text-white overflow-x-hidden min-h-screen transition-colors duration-300">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#6c63ff]/10 dark:bg-[#6c63ff]/5 blur-3xl"></div>
        <div className="absolute top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#00d4ff]/10 dark:bg-[#00d4ff]/5 blur-3xl"></div>
      </div>

      {/* HEADER */}
      <PublicHeader />

      {/* FEATURES HEADER */}
      <section className="max-w-4xl mx-auto px-6 pt-16 lg:pt-20 text-center reveal">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6c63ff] dark:text-[#9aa0ff] bg-[#6c63ff]/10 dark:bg-[#6c63ff]/20 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] dark:bg-[#9aa0ff]"></span> Built for modern workflows
        </span>
        <h1 className="text-[40px] sm:text-[54px] leading-[1.06] font-extrabold tracking-tight text-[#1a1a2e] dark:text-white">
          Every scheduling superpower.<br />
          <span className="bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">Zero friction.</span>
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[#1a1a2e]/60 dark:text-white/60 max-w-2xl mx-auto">
          Explore all the intelligent scheduling and automation capabilities designed to save you hours every week.
        </p>
      </section>

      {/* FEATURE CARDS LIST */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <FeatureCards />
      </section>

      {/* CTA CARD */}
      <section className="px-6 pb-24 pt-4">
        <div className="reveal relative max-w-6xl mx-auto rounded-[32px] bg-[#1a1a2e] overflow-hidden px-8 py-16 sm:py-20 text-center">
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-[#6c63ff]/30 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#00d4ff]/20 blur-3xl"></div>
          <div className="relative">
            <h2 className="text-[34px] sm:text-[44px] font-extrabold tracking-tight text-white leading-[1.1] keep-white">
              Supercharge your scheduling workflow today.
            </h2>
            <p className="text-white/60 mt-4 text-[16px] max-w-xl mx-auto">
              Get started with EdOra for free. No credit card required, setup in 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] text-white text-[15px] font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#6c63ff]/40 hover:scale-[1.03] transition keep-white"
              >
                Start Scheduling Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-[15px] font-bold px-8 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition keep-white"
              >
                Book a demo
              </Link>
            </div>
            <p className="mt-6 text-[12px] text-white/40">
              0% booking commission · GDPR compliant · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}

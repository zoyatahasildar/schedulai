// app/page.tsx
// Landing page — public homepage (ChronoAI)
// Owned by: Lead

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import FeatureCards from "@/components/FeatureCards";

export default function LandingPage() {
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

    const cObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const to = Number(el.dataset.to || "0");
          const dur = 1400;
          let startTs: number | null = null;
          const tick = (t: number) => {
            if (startTs === null) startTs = t;
            const p = Math.min((t - startTs) / dur, 1);
            el.textContent = Math.floor(p * to).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          cObs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll(".lp .countup").forEach((el) => cObs.observe(el));

    return () => {
      io.disconnect();
      cObs.disconnect();
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

      {/* HERO (centered) */}
      <section className="max-w-4xl mx-auto px-6 pt-16 lg:pt-20 text-center">
        <span className="reveal inline-flex items-center gap-2 text-[13px] font-semibold text-[#6c63ff] dark:text-[#9aa0ff] bg-[#6c63ff]/10 dark:bg-[#6c63ff]/20 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] dark:bg-[#9aa0ff]"></span> Modern scheduling
        </span>
        <h1 className="reveal text-[40px] sm:text-[58px] leading-[1.04] font-extrabold tracking-tight text-[#1a1a2e] dark:text-white">
          Smarter scheduling,<br />
          <span className="bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">made simple.</span>
        </h1>
        <p className="reveal mt-5 text-[17px] leading-relaxed text-[#1a1a2e]/60 dark:text-white/60 max-w-2xl mx-auto">
          Share one link, set your availability, and let guests book the perfect time. Look polished, save hours, and never double-book.
        </p>
        <div className="reveal mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] text-white text-[15px] font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-[#6c63ff]/30 hover:scale-[1.03] transition"
          >
            Start Scheduling Free
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center justify-center gap-2 text-[15px] font-bold px-7 py-3.5 rounded-2xl border-2 border-[#1a1a2e]/10 dark:border-white/10 text-[#1a1a2e] dark:text-white hover:border-[#6c63ff]/40 hover:text-[#6c63ff] dark:hover:border-[#00d4ff]/40 dark:hover:text-[#00d4ff] transition"
          >
            See How It Works
          </Link>
        </div>
        <div className="reveal mt-8 flex items-center gap-4 flex-wrap justify-center">
          <span className="inline-flex items-center gap-2 text-[15px] font-extrabold tracking-tight text-[#1a1a2e] dark:text-white">
            <span className="w-7 h-7 rounded-full bg-[#6c63ff]/10 dark:bg-[#6c63ff]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#6c63ff] dark:text-[#9aa0ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            Smarter scheduling
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#00d4ff]"></span>
          <span className="inline-flex items-center gap-2 text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">
            <span className="w-7 h-7 rounded-full bg-[#00d4ff]/10 dark:bg-[#00d4ff]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#00b8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 6l-9.5 9.5-5-5L1 18" />
                <path d="M17 6h6v6" />
              </svg>
            </span>
            Effortless growth
          </span>
        </div>
      </section>

      {/* DASHBOARD MOCKUP (keeps its premium dark theme presentation) */}
      <section className="max-w-6xl mx-auto px-6 mt-14 pb-8 reveal">
        <div className="rounded-2xl overflow-hidden bg-[#0b1020] border border-white/10 shadow-2xl shadow-[#1a1a2e]/40">
          <div className="flex items-center gap-1.5 px-4 h-10 bg-white/5 border-b border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-400/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400/80"></span>
            <span className="ml-3 text-[11px] text-white/44 font-mono">app.edora.com/dashboard</span>
          </div>
          <div className="flex">
            {/* SIDEBAR */}
            <aside className="hidden sm:flex flex-col w-44 flex-shrink-0 bg-[#0d1326] border-r border-white/5 p-3">
              <div className="flex items-center gap-2 px-2 mb-5">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
                  </svg>
                </span>
                <span className="text-[13px] font-extrabold text-white">Ed<span className="text-[#6c63ff]">Ora</span></span>
              </div>
              <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#6c63ff]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff]"></span> Dashboard
              </a>
              <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-white/25"></span> Event Types</a>
              <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-white/25"></span> Bookings</a>
              <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-white/25"></span> Availability</a>
              <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-white/25"></span> Analytics</a>
              <a className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span className="w-1.5 h-1.5 rounded-full bg-white/25"></span> Settings</a>
              <div className="mt-auto rounded-xl bg-gradient-to-br from-[#6c63ff]/25 to-[#00d4ff]/10 p-3 border border-white/10">
                <p className="text-[11px] font-bold text-white">Upgrade to Pro</p>
                <p className="text-[10px] text-white/50 mt-0.5 leading-snug">Unlock advanced scheduling &amp; payments.</p>
              </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 min-w-0 p-3 sm:p-4 bg-[#0b1020]">
              <div className="rounded-xl bg-gradient-to-r from-[#3b5bdb] via-[#4263eb] to-[#00d4ff] p-4 flex items-center justify-between overflow-hidden">
                <div>
                  <p className="text-[11px] text-white/80">Welcome to EdOra 👋</p>
                  <p className="text-[18px] sm:text-[22px] font-extrabold text-white leading-tight">Your week, organized</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Here's what's happening with your bookings.</p>
                </div>
                <div className="hidden sm:flex gap-2">
                  <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center text-[#9aa0ff] text-[12px]">📅</span>
                    <span className="text-[9px] font-bold text-emerald-400">↑20%</span>
                  </div>
                  <p className="text-[20px] font-extrabold text-white mt-2 leading-none countup" data-to="12">0</p>
                  <p className="text-[10px] text-white/45 mt-1">Bookings</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center text-[12px]">⚡</span>
                    <span className="text-[9px] font-bold text-emerald-400">↑10%</span>
                  </div>
                  <p className="text-[20px] font-extrabold text-white mt-2 leading-none countup" data-to="4">0</p>
                  <p className="text-[10px] text-white/45 mt-1">This week</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-[12px]">✅</span>
                    <span className="text-[9px] font-bold text-emerald-400">↑18%</span>
                  </div>
                  <p className="text-[20px] font-extrabold text-white mt-2 leading-none">
                    <span className="countup" data-to="85">0</span>%
                  </p>
                  <p className="text-[10px] text-white/45 mt-1">Booking rate</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-[12px]">💰</span>
                    <span className="text-[9px] font-bold text-emerald-400">↑18%</span>
                  </div>
                  <p className="text-[20px] font-extrabold text-white mt-2 leading-none">
                    ₹<span className="countup" data-to="2400">0</span>
                  </p>
                  <p className="text-[10px] text-white/45 mt-1">Revenue</p>
                </div>
              </div>

              {/* two columns */}
              <div className="grid lg:grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-bold text-white">Upcoming Bookings</p>
                    <span className="text-[10px] font-bold text-[#9aa0ff]">View all</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center text-[10px] font-bold text-white">DC</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">Design Consultation</p>
                        <p className="text-[9px] text-white/40">28 Jun · 10:00 AM</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white">PD</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">Product Demo</p>
                        <p className="text-[9px] text-white/40">28 Jun · 1:30 PM</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">SC</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">Strategy Call</p>
                        <p className="text-[9px] text-white/40">29 Jun · 11:00 AM</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">Pending</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">OC</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">Onboarding Call</p>
                        <p className="text-[9px] text-white/40">30 Jun · 2:00 PM</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">Confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[12px] font-bold text-white">Booking Overview</p>
                    <span className="text-[10px] text-white/40">This Week</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-28">
                    <div className="flex-1 rounded-t bg-[#6c63ff]/50" style={{ height: "35%" }}></div>
                    <div className="flex-1 rounded-t bg-[#6c63ff]/40" style={{ height: "25%" }}></div>
                    <div className="flex-1 rounded-t bg-[#6c63ff]/70" style={{ height: "60%" }}></div>
                    <div className="flex-1 rounded-t bg-[#6c63ff]/80" style={{ height: "80%" }}></div>
                    <div className="flex-1 rounded-t bg-gradient-to-t from-[#6c63ff] to-[#00d4ff]" style={{ height: "100%" }}></div>
                    <div className="flex-1 rounded-t bg-[#6c63ff]/50" style={{ height: "45%" }}></div>
                    <div className="flex-1 rounded-t bg-[#6c63ff]/30" style={{ height: "20%" }}></div>
                  </div>
                  <div className="flex justify-between gap-2 mt-2 text-[9px] text-white/35 font-mono">
                    <span className="flex-1 text-center">Mon</span>
                    <span className="flex-1 text-center">Tue</span>
                    <span className="flex-1 text-center">Wed</span>
                    <span className="flex-1 text-center">Thu</span>
                    <span className="flex-1 text-center">Fri</span>
                    <span className="flex-1 text-center">Sat</span>
                    <span className="flex-1 text-center">Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section id="social" className="py-12 border-y border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] overflow-hidden transition-colors duration-300">
        <p className="text-center text-[13px] font-semibold uppercase tracking-widest text-[#1a1a2e]/40 dark:text-white/40 mb-7 transition-colors duration-300">
          Trusted by fast-growing teams worldwide
        </p>
        <div className="relative max-w-6xl mx-auto overflow-hidden">
          <div className="flex gap-16 marquee w-max items-center text-[#1a1a2e]/30 dark:text-white/30 font-extrabold text-xl tracking-tight transition-colors duration-300">
            <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
            <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
            <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
            <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
            <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
            <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 pt-24 pb-4">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="text-[13px] font-bold uppercase tracking-widest text-[#6c63ff] dark:text-[#9aa0ff]">How it works</span>
          <h2 className="text-[34px] sm:text-[42px] font-extrabold tracking-tight mt-3 text-[#1a1a2e] dark:text-white">
            Live in three simple steps
          </h2>
          <p className="text-[#1a1a2e]/55 dark:text-white/55 mt-4 text-[16px] transition-colors duration-300">
            No setup headaches. Go from sign-up to your first booking in minutes.
          </p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-6 mt-16">
          <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#6c63ff]/30 via-[#00d4ff]/30 to-[#6c63ff]/30"></div>
          <div className="reveal relative text-center">
            <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center shadow-xl shadow-[#6c63ff]/30">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
              </svg>
            </div>
            <span className="inline-block mt-4 text-[12px] font-extrabold text-[#6c63ff] dark:text-[#9aa0ff]">STEP 1</span>
            <h3 className="text-[19px] font-extrabold mt-1 text-[#1a1a2e] dark:text-white">Set your availability</h3>
            <p className="text-[14px] text-[#1a1a2e]/55 dark:text-white/55 mt-2 max-w-xs mx-auto leading-relaxed transition-colors duration-300">
              Mark the hours you're free on a simple weekly grid. Set it once — timezones are handled.
            </p>
          </div>
          <div className="reveal relative text-center">
            <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#00d4ff] to-emerald-400 flex items-center justify-center shadow-xl shadow-[#00d4ff]/30">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
              </svg>
            </div>
            <span className="inline-block mt-4 text-[12px] font-extrabold text-[#0e9aa7] dark:text-[#00d4ff]">STEP 2</span>
            <h3 className="text-[19px] font-extrabold mt-1 text-[#1a1a2e] dark:text-white">Share your link</h3>
            <p className="text-[14px] text-[#1a1a2e]/55 dark:text-white/55 mt-2 max-w-xs mx-auto leading-relaxed transition-colors duration-300">
              Send one personal booking link. Guests pick a slot that works — no back-and-forth emails.
            </p>
          </div>
          <div className="reveal relative text-center">
            <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-emerald-400 to-[#6c63ff] flex items-center justify-center shadow-xl shadow-emerald-400/30">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>
            <span className="inline-block mt-4 text-[12px] font-extrabold text-emerald-500">STEP 3</span>
            <h3 className="text-[19px] font-extrabold mt-1 text-[#1a1a2e] dark:text-white">Get booked &amp; paid</h3>
            <p className="text-[14px] text-[#1a1a2e]/55 dark:text-white/55 mt-2 max-w-xs mx-auto leading-relaxed transition-colors duration-300">
              Bookings auto-confirm, reminders go out, and payments land — all on autopilot.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto reveal mb-14 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-default">
          <span className="text-[13px] font-bold uppercase tracking-widest text-[#6c63ff] dark:text-[#9aa0ff]">Everything you need</span>
          <h2 className="text-[34px] sm:text-[42px] font-extrabold tracking-tight mt-3 text-[#1a1a2e] dark:text-white">
            One platform. Every scheduling superpower.
          </h2>
          <p className="text-[#1a1a2e]/55 dark:text-white/55 mt-4 text-[16px] transition-colors duration-300">
            From timezone-smart availability to calendar syncing — EdOra replaces the tangle of tools you're juggling today.
          </p>
        </div>
        
        {/* Render our interactive FeatureCards here */}
        <FeatureCards />
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24 pt-4">
        <div className="reveal relative max-w-6xl mx-auto rounded-[32px] bg-[#1a1a2e] overflow-hidden px-8 py-16 sm:py-20 text-center">
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-[#6c63ff]/30 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#00d4ff]/20 blur-3xl"></div>
          <div className="relative">
            <h2 className="text-[34px] sm:text-[48px] font-extrabold tracking-tight text-white leading-[1.08] keep-white">
              Ready to look polished<br />and book more?
            </h2>
            <p className="text-white/60 mt-4 text-[16px] max-w-xl mx-auto">
              Scheduling made simple. Free to start — no credit card required.
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

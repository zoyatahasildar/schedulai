// app/page.tsx
// Landing page — public homepage (ScheduleAI)
// Owned by: Lead
"use client";

import { useEffect } from "react";

const HTML = `
<div class="lp bg-[#fbfbfe] text-[#1a1a2e] overflow-x-hidden">
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#6c63ff]/10 blur-3xl"></div>
    <div class="absolute top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#00d4ff]/10 blur-3xl"></div>
  </div>

  <!-- NAV -->
  <header class="sticky top-0 z-50 glass border-b border-black/5">
    <nav class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center shadow-lg shadow-[#6c63ff]/30">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
        </span>
        <span class="text-[17px] font-extrabold tracking-tight">Schedule<span class="text-[#6c63ff]">AI</span></span>
      </a>
      <div class="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#1a1a2e]/70">
        <a href="#features" class="hover:text-[#6c63ff] transition">Features</a>
        <a href="#how" class="hover:text-[#6c63ff] transition">How it works</a>
        <a href="#social" class="hover:text-[#6c63ff] transition">Customers</a>
      </div>
      <div class="flex items-center gap-3">
        <a href="/login?mode=login" class="hidden sm:inline text-[14px] font-semibold text-[#1a1a2e]/70 hover:text-[#1a1a2e] transition">Log in</a>
        <a href="/login?mode=signup" class="text-[14px] font-bold text-white bg-[#1a1a2e] px-4 py-2 rounded-xl hover:bg-[#16213e] transition shadow-sm">Get Started Free</a>
      </div>
    </nav>
  </header>

  <!-- HERO (centered) -->
  <section class="max-w-4xl mx-auto px-6 pt-16 lg:pt-20 text-center">
    <span class="reveal inline-flex items-center gap-2 text-[13px] font-semibold text-[#6c63ff] bg-[#6c63ff]/10 px-3 py-1.5 rounded-full mb-6">
      <span class="w-1.5 h-1.5 rounded-full bg-[#6c63ff]"></span> AI-powered scheduling
    </span>
    <h1 class="reveal text-[40px] sm:text-[58px] leading-[1.04] font-extrabold tracking-tight">
      Smarter scheduling,<br>
      <span class="bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">powered by AI.</span>
    </h1>
    <p class="reveal mt-5 text-[17px] leading-relaxed text-[#1a1a2e]/60 max-w-2xl mx-auto">
      Share one link, set your availability, and let guests book the perfect time — while AI handles the busywork. Look polished, save hours, never double-book.
    </p>
    <div class="reveal mt-8 flex flex-col sm:flex-row gap-3 justify-center">
      <a href="/login" class="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] text-white text-[15px] font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-[#6c63ff]/30 hover:scale-[1.03] transition">
        Start Scheduling Free
        <svg class="w-4 h-4 group-hover:translate-x-1 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <a href="#how" class="inline-flex items-center justify-center gap-2 text-[15px] font-bold px-7 py-3.5 rounded-2xl border-2 border-[#1a1a2e]/10 text-[#1a1a2e] hover:border-[#6c63ff]/40 hover:text-[#6c63ff] transition">
        See How It Works
      </a>
    </div>
    <div class="reveal mt-8 flex items-center gap-4 flex-wrap justify-center">
      <span class="inline-flex items-center gap-2 text-[15px] font-extrabold tracking-tight text-[#1a1a2e]">
        <span class="w-7 h-7 rounded-full bg-[#6c63ff]/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-[#6c63ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </span>
        Smarter scheduling
      </span>
      <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#00d4ff]"></span>
      <span class="inline-flex items-center gap-2 text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">
        <span class="w-7 h-7 rounded-full bg-[#00d4ff]/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-[#00b8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
        </span>
        Effortless growth
      </span>
    </div>
  </section>

  <!-- DASHBOARD MOCKUP -->
  <section class="max-w-6xl mx-auto px-6 mt-14 pb-8 reveal">
    <div class="rounded-2xl overflow-hidden bg-[#0b1020] border border-white/10 shadow-2xl shadow-[#1a1a2e]/40">
      <div class="flex items-center gap-1.5 px-4 h-10 bg-white/5 border-b border-white/10">
        <span class="w-3 h-3 rounded-full bg-red-400/80"></span>
        <span class="w-3 h-3 rounded-full bg-amber-400/80"></span>
        <span class="w-3 h-3 rounded-full bg-emerald-400/80"></span>
        <span class="ml-3 text-[11px] text-white/40 font-mono">app.scheduleai.com/dashboard</span>
      </div>
      <div class="flex">
        <!-- SIDEBAR -->
        <aside class="hidden sm:flex flex-col w-44 flex-shrink-0 bg-[#0d1326] border-r border-white/5 p-3">
          <div class="flex items-center gap-2 px-2 mb-5">
            <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
            </span>
            <span class="text-[13px] font-extrabold text-white">Schedule<span class="text-[#6c63ff]">AI</span></span>
          </div>
          <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white bg-[#6c63ff]/20">
            <span class="w-1.5 h-1.5 rounded-full bg-[#6c63ff]"></span> Dashboard
          </a>
          <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span class="w-1.5 h-1.5 rounded-full bg-white/25"></span> Event Types</a>
          <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span class="w-1.5 h-1.5 rounded-full bg-white/25"></span> Bookings</a>
          <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span class="w-1.5 h-1.5 rounded-full bg-white/25"></span> Availability</a>
          <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span class="w-1.5 h-1.5 rounded-full bg-white/25"></span> Analytics</a>
          <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white"><span class="w-1.5 h-1.5 rounded-full bg-white/25"></span> Settings</a>
          <div class="mt-auto rounded-xl bg-gradient-to-br from-[#6c63ff]/25 to-[#00d4ff]/10 p-3 border border-white/10">
            <p class="text-[11px] font-bold text-white">Upgrade to Pro</p>
            <p class="text-[10px] text-white/50 mt-0.5 leading-snug">Unlock advanced AI &amp; payments.</p>
          </div>
        </aside>

        <!-- MAIN -->
        <div class="flex-1 min-w-0 p-3 sm:p-4 bg-[#0b1020]">
          <!-- blue welcome banner -->
          <div class="rounded-xl bg-gradient-to-r from-[#3b5bdb] via-[#4263eb] to-[#00d4ff] p-4 flex items-center justify-between overflow-hidden">
            <div>
              <p class="text-[11px] text-white/80">Welcome to ScheduleAI 👋</p>
              <p class="text-[18px] sm:text-[22px] font-extrabold text-white leading-tight">Your week, organized</p>
              <p class="text-[11px] text-white/70 mt-0.5">Here's what's happening with your bookings.</p>
            </div>
            <div class="hidden sm:flex gap-2">
              <span class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
              <span class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
            </div>
          </div>

          <!-- stat cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <div class="rounded-xl bg-white/5 border border-white/10 p-3">
              <div class="flex items-center justify-between"><span class="w-7 h-7 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center text-[#9aa0ff] text-[12px]">📅</span><span class="text-[9px] font-bold text-emerald-400">↑20%</span></div>
              <p class="text-[20px] font-extrabold text-white mt-2 leading-none countup" data-to="12">0</p>
              <p class="text-[10px] text-white/45 mt-1">Bookings</p>
            </div>
            <div class="rounded-xl bg-white/5 border border-white/10 p-3">
              <div class="flex items-center justify-between"><span class="w-7 h-7 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center text-[12px]">⚡</span><span class="text-[9px] font-bold text-emerald-400">↑10%</span></div>
              <p class="text-[20px] font-extrabold text-white mt-2 leading-none countup" data-to="4">0</p>
              <p class="text-[10px] text-white/45 mt-1">This week</p>
            </div>
            <div class="rounded-xl bg-white/5 border border-white/10 p-3">
              <div class="flex items-center justify-between"><span class="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-[12px]">✅</span><span class="text-[9px] font-bold text-emerald-400">↑18%</span></div>
              <p class="text-[20px] font-extrabold text-white mt-2 leading-none"><span class="countup" data-to="85">0</span>%</p>
              <p class="text-[10px] text-white/45 mt-1">Booking rate</p>
            </div>
            <div class="rounded-xl bg-white/5 border border-white/10 p-3">
              <div class="flex items-center justify-between"><span class="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-[12px]">💰</span><span class="text-[9px] font-bold text-emerald-400">↑18%</span></div>
              <p class="text-[20px] font-extrabold text-white mt-2 leading-none">₹<span class="countup" data-to="2400">0</span></p>
              <p class="text-[10px] text-white/45 mt-1">Revenue</p>
            </div>
          </div>

          <!-- two columns -->
          <div class="grid lg:grid-cols-2 gap-3 mt-3">
            <!-- upcoming bookings -->
            <div class="rounded-xl bg-white/5 border border-white/10 p-4">
              <div class="flex items-center justify-between mb-3"><p class="text-[12px] font-bold text-white">Upcoming Bookings</p><span class="text-[10px] font-bold text-[#9aa0ff]">View all</span></div>
              <div class="space-y-2.5">
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center text-[10px] font-bold text-white">DC</span>
                  <div class="flex-1 min-w-0"><p class="text-[11px] font-semibold text-white truncate">Design Consultation</p><p class="text-[9px] text-white/40">28 Jun · 10:00 AM</p></div>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">Confirmed</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white">PD</span>
                  <div class="flex-1 min-w-0"><p class="text-[11px] font-semibold text-white truncate">Product Demo</p><p class="text-[9px] text-white/40">28 Jun · 1:30 PM</p></div>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">Confirmed</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">SC</span>
                  <div class="flex-1 min-w-0"><p class="text-[11px] font-semibold text-white truncate">Strategy Call</p><p class="text-[9px] text-white/40">29 Jun · 11:00 AM</p></div>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">Pending</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">OC</span>
                  <div class="flex-1 min-w-0"><p class="text-[11px] font-semibold text-white truncate">Onboarding Call</p><p class="text-[9px] text-white/40">30 Jun · 2:00 PM</p></div>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">Confirmed</span>
                </div>
              </div>
            </div>

            <!-- booking overview chart -->
            <div class="rounded-xl bg-white/5 border border-white/10 p-4">
              <div class="flex items-center justify-between mb-4"><p class="text-[12px] font-bold text-white">Booking Overview</p><span class="text-[10px] text-white/40">This Week</span></div>
              <div class="flex items-end justify-between gap-2 h-28">
                <div class="flex-1 rounded-t bg-[#6c63ff]/50" style="height:35%"></div>
                <div class="flex-1 rounded-t bg-[#6c63ff]/40" style="height:25%"></div>
                <div class="flex-1 rounded-t bg-[#6c63ff]/70" style="height:60%"></div>
                <div class="flex-1 rounded-t bg-[#6c63ff]/80" style="height:80%"></div>
                <div class="flex-1 rounded-t bg-gradient-to-t from-[#6c63ff] to-[#00d4ff]" style="height:100%"></div>
                <div class="flex-1 rounded-t bg-[#6c63ff]/50" style="height:45%"></div>
                <div class="flex-1 rounded-t bg-[#6c63ff]/30" style="height:20%"></div>
              </div>
              <div class="flex justify-between gap-2 mt-2 text-[9px] text-white/35 font-mono">
                <span class="flex-1 text-center">Mon</span><span class="flex-1 text-center">Tue</span><span class="flex-1 text-center">Wed</span><span class="flex-1 text-center">Thu</span><span class="flex-1 text-center">Fri</span><span class="flex-1 text-center">Sat</span><span class="flex-1 text-center">Sun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LOGO STRIP -->
  <section id="social" class="py-12 border-y border-black/5 bg-white/40 overflow-hidden">
    <p class="text-center text-[13px] font-semibold uppercase tracking-widest text-[#1a1a2e]/40 mb-7">Trusted by fast-growing teams worldwide</p>
    <div class="relative max-w-6xl mx-auto overflow-hidden">
      <div class="flex gap-16 marquee w-max items-center text-[#1a1a2e]/30 font-extrabold text-xl tracking-tight">
        <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
        <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
        <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
        <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
        <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
        <span>◆ EdMentor</span><span>EdCompass</span><span>● Edtraining</span><span>Edlearning</span><span>Edquiz ▲</span>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section id="how" class="max-w-7xl mx-auto px-6 pt-24 pb-4">
    <div class="text-center max-w-2xl mx-auto reveal">
      <span class="text-[13px] font-bold uppercase tracking-widest text-[#6c63ff]">How it works</span>
      <h2 class="text-[34px] sm:text-[42px] font-extrabold tracking-tight mt-3">Live in three simple steps</h2>
      <p class="text-[#1a1a2e]/55 mt-4 text-[16px]">No setup headaches. Go from sign-up to your first booking in minutes.</p>
    </div>
    <div class="relative grid md:grid-cols-3 gap-6 mt-16">
      <div class="hidden md:block absolute top-9 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#6c63ff]/30 via-[#00d4ff]/30 to-[#6c63ff]/30"></div>
      <div class="reveal relative text-center">
        <div class="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center shadow-xl shadow-[#6c63ff]/30">
          <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></svg>
        </div>
        <span class="inline-block mt-4 text-[12px] font-extrabold text-[#6c63ff]">STEP 1</span>
        <h3 class="text-[19px] font-extrabold mt-1">Set your availability</h3>
        <p class="text-[14px] text-[#1a1a2e]/55 mt-2 max-w-xs mx-auto leading-relaxed">Mark the hours you're free on a simple weekly grid. Set it once — timezones are handled.</p>
      </div>
      <div class="reveal relative text-center">
        <div class="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#00d4ff] to-emerald-400 flex items-center justify-center shadow-xl shadow-[#00d4ff]/30">
          <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
        </div>
        <span class="inline-block mt-4 text-[12px] font-extrabold text-[#0e9aa7]">STEP 2</span>
        <h3 class="text-[19px] font-extrabold mt-1">Share your link</h3>
        <p class="text-[14px] text-[#1a1a2e]/55 mt-2 max-w-xs mx-auto leading-relaxed">Send one personal booking link. Guests pick a slot that works — no back-and-forth emails.</p>
      </div>
      <div class="reveal relative text-center">
        <div class="mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-emerald-400 to-[#6c63ff] flex items-center justify-center shadow-xl shadow-emerald-400/30">
          <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
        </div>
        <span class="inline-block mt-4 text-[12px] font-extrabold text-emerald-500">STEP 3</span>
        <h3 class="text-[19px] font-extrabold mt-1">Get booked &amp; paid</h3>
        <p class="text-[14px] text-[#1a1a2e]/55 mt-2 max-w-xs mx-auto leading-relaxed">Bookings auto-confirm, reminders go out, and payments land — all on autopilot.</p>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features" class="max-w-7xl mx-auto px-6 py-24">
    <div class="text-center max-w-2xl mx-auto reveal">
      <span class="text-[13px] font-bold uppercase tracking-widest text-[#6c63ff]">Everything you need</span>
      <h2 class="text-[34px] sm:text-[42px] font-extrabold tracking-tight mt-3">One platform. Every scheduling superpower.</h2>
      <p class="text-[#1a1a2e]/55 mt-4 text-[16px]">From timezone-smart availability to AI booking — ScheduleAI replaces the tangle of tools you're juggling today.</p>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#4f46e5;--cs:rgba(79,70,229,.38)">
        <div class="w-12 h-12 rounded-xl bg-[#6c63ff]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-[#6c63ff]">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">Smart Availability</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">Auto timezone detection so guests always see their local time. Set hours once.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#0e7490;--cs:rgba(14,116,144,.36)">
        <div class="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-[#00b8d4]">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">AI Booking Assistant</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">A 24/7 chatbot that answers guest questions and books meetings conversationally.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#be185d;--cs:rgba(190,24,93,.36)">
        <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-pink-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">Personalized Booking Links</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">Create multiple link types — 15, 30 or 60-min — each with its own page and purpose.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#047857;--cs:rgba(4,120,87,.36)">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-emerald-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">Paid Bookings</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">Charge for sessions and packages with 0% booking commission. Keep what you earn.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#6d28d9;--cs:rgba(109,40,217,.36)">
        <div class="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-violet-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6M3 22v-6h6M3.5 9a9 9 0 0 1 14.85-3.36L21 8M21 15a9 9 0 0 1-14.85 3.36L3 16"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">2-Way Calendar Sync</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">Sync with Google, Outlook &amp; iCal so you're never double-booked across calendars.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#be123c;--cs:rgba(190,18,60,.36)">
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-rose-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">Automated Reminders</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">Email and SMS reminders that cut no-shows without you lifting a finger.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#0f766e;--cs:rgba(15,118,110,.36)">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-teal-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 15l3-4 3 2 4-6"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">Analytics Dashboard</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">AI weekly reports on revenue, busiest hours, and your best-performing events.</p>
      </div>
      <div class="feat-card reveal group rounded-2xl bg-white p-6 border border-black/5 shadow-sm" style="--c:#b45309;--cs:rgba(180,83,9,.36)">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition text-amber-500">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        </div>
        <h3 class="font-bold text-[16px] transition-colors">No Double Bookings</h3>
        <p class="text-[13.5px] text-[#1a1a2e]/55 mt-1.5 leading-relaxed">Real-time conflict checking guarantees a slot is never handed out twice.</p>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="px-6 pb-24 pt-4">
    <div class="reveal relative max-w-6xl mx-auto rounded-[32px] bg-[#1a1a2e] overflow-hidden px-8 py-16 sm:py-20 text-center">
      <div class="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-[#6c63ff]/30 blur-3xl"></div>
      <div class="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#00d4ff]/20 blur-3xl"></div>
      <div class="relative">
        <h2 class="text-[34px] sm:text-[48px] font-extrabold tracking-tight text-white leading-[1.08]">Ready to look polished<br>and book more?</h2>
        <p class="text-white/60 mt-4 text-[16px] max-w-xl mx-auto">Scheduling smarter with AI. Free to start — no credit card required.</p>
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/login" class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] text-white text-[15px] font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#6c63ff]/40 hover:scale-[1.03] transition">Start Scheduling Free</a>
          <a href="/login" class="inline-flex items-center justify-center gap-2 text-[15px] font-bold px-8 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition">Book a demo</a>
        </div>
        <p class="mt-6 text-[12px] text-white/40">0% booking commission · GDPR compliant · Cancel anytime</p>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-black/5 py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#00d4ff] flex items-center justify-center">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>
        </span>
        <span class="font-extrabold">Schedule<span class="text-[#6c63ff]">AI</span></span>
      </div>
      <p class="text-[13px] text-[#1a1a2e]/45">© 2026 ScheduleAI · Smart Scheduling, Powered by AI</p>
      <div class="flex gap-5 text-[13px] text-[#1a1a2e]/50 font-medium">
        <a href="#" class="hover:text-[#6c63ff]">Privacy</a>
        <a href="#" class="hover:text-[#6c63ff]">Terms</a>
        <a href="#" class="hover:text-[#6c63ff]">Contact</a>
      </div>
    </div>
  </footer>
</div>
`;

export default function LandingPage() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll(".lp .reveal").forEach((el) => io.observe(el));

    const cObs = new IntersectionObserver((entries) => {
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
    }, { threshold: 0.4 });
    document.querySelectorAll(".lp .countup").forEach((el) => cObs.observe(el));

    return () => { io.disconnect(); cObs.disconnect(); };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}

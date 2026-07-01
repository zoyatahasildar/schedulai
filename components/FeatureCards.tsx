// components/FeatureCards.tsx
// Interactive, animated feature cards for the landing page
// Owned by: Lead
"use client";

import { Calendar, Zap, Clock, Shield, Users, BarChart3 } from "lucide-react";

type Feature = {
  icon: typeof Calendar;
  title: string;
  desc: string;
  theme: string; // solid theme color
  soft: string; // soft tint (icon bg + glow)
  strong: string; // stronger glow for shadow
};

const FEATURES: Feature[] = [
  {
    icon: Calendar,
    title: "Smart Availability",
    desc: "Set your weekly schedule once. ChronoAI handles timezone conversions automatically.",
    theme: "#3b82f6",
    soft: "rgba(59,130,246,0.12)",
    strong: "rgba(59,130,246,0.40)",
  },
  {
    icon: Zap,
    title: "AI Chatbot Assistant",
    desc: 'Guests can ask "When are you free?" and get instant answers powered by Gemini AI.',
    theme: "#8b5cf6",
    soft: "rgba(139,92,246,0.12)",
    strong: "rgba(139,92,246,0.40)",
  },
  {
    icon: Clock,
    title: "Instant Booking",
    desc: "Guests pick a slot, fill in their details, and get a confirmation email instantly.",
    theme: "#22c55e",
    soft: "rgba(34,197,94,0.12)",
    strong: "rgba(34,197,94,0.40)",
  },
  {
    icon: Shield,
    title: "No Double Bookings",
    desc: "Real-time conflict checking ensures your calendar is always accurate.",
    theme: "#f97316",
    soft: "rgba(249,115,22,0.12)",
    strong: "rgba(249,115,22,0.40)",
  },
  {
    icon: Users,
    title: "Multiple Event Types",
    desc: "Create 30-min calls, 1-hour consultations, or custom meeting types.",
    theme: "#ec4899",
    soft: "rgba(236,72,153,0.12)",
    strong: "rgba(236,72,153,0.40)",
  },
  {
    icon: BarChart3,
    title: "AI Analytics",
    desc: "Weekly AI-generated reports summarizing your bookings and peak hours.",
    theme: "#14b8a6",
    soft: "rgba(20,184,166,0.12)",
    strong: "rgba(20,184,166,0.40)",
  },
];

function spawnRipple(e: React.PointerEvent<HTMLDivElement>) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "feat-ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  card.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

export default function FeatureCards() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map(({ icon: Icon, title, desc, theme, soft, strong }, i) => (
          <div
            key={title}
            tabIndex={0}
            onPointerDown={spawnRipple}
            className="feat-card group relative overflow-hidden rounded-2xl bg-white dark:bg-[#131a2e] p-6 border border-violet-100 dark:border-white/[0.05] outline-none cursor-pointer"
            style={
              {
                "--theme": theme,
                "--soft": soft,
                "--strong": strong,
                animationDelay: `${0.05 + i * 0.1}s`,
              } as React.CSSProperties
            }
          >
            {/* animated gradient background (fades in on hover) */}
            <span className="feat-bg" aria-hidden />
            {/* gradient line sweeping across the top edge */}
            <span className="feat-sweep" aria-hidden />

            <div className="relative z-10">
              <div
                className="feat-icon w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: soft, color: theme }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scoped styles for the interactions */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .feat-card {
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          isolation: isolate;
          transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
          opacity: 0;
          transform: translateY(24px);
          animation: featUp 0.6s var(--ease) forwards;
        }
        @keyframes featUp { to { opacity: 1; transform: translateY(0); } }

        .feat-card:hover, .feat-card:focus-visible {
          transform: translateY(-14px) scale(1.02);
          border-color: var(--theme);
          box-shadow: 0 26px 50px -12px var(--strong), 0 0 0 1px var(--theme) inset, 0 0 34px -10px var(--strong);
        }

        .feat-bg {
          position: absolute; inset: 0; z-index: 0; border-radius: inherit;
          background: radial-gradient(120% 120% at 0% 0%, var(--soft) 0%, transparent 55%);
          background-size: 200% 200%;
          opacity: 0;
          transition: opacity 0.3s var(--ease);
          animation: featDrift 7s ease-in-out infinite alternate;
        }
        .feat-card:hover .feat-bg, .feat-card:focus-visible .feat-bg { opacity: 1; }
        @keyframes featDrift { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }

        .feat-sweep {
          position: absolute; top: 0; left: 0; height: 3px; width: 100%; z-index: 1;
          background: linear-gradient(90deg, transparent, var(--theme), transparent);
          transform: translateX(-100%);
        }
        .feat-card:hover .feat-sweep, .feat-card:focus-visible .feat-sweep {
          transform: translateX(100%);
          transition: transform 0.7s var(--ease);
        }

        .feat-icon { transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease); }
        .feat-card:hover .feat-icon, .feat-card:focus-visible .feat-icon {
          transform: translateY(-8px) scale(1.08);
          box-shadow: 0 12px 24px -8px var(--strong);
        }

        .feat-ripple {
          position: absolute; border-radius: 50%; transform: scale(0);
          background: var(--strong); opacity: 0.5; pointer-events: none; z-index: 0;
          animation: featRipple 0.6s ease-out forwards;
        }
        @keyframes featRipple { to { transform: scale(3.2); opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .feat-card, .feat-bg, .feat-icon { animation: none !important; transition: none !important; opacity: 1; transform: none; }
        }
      `,
        }}
      />
    </>
  );
}

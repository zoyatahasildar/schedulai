// app/dashboard/settings/BillingSection.tsx
// Billing settings section — ScheduleAI design
"use client";

import { useState } from "react";
import {
  CreditCard, Check, CircleDot, ArrowUpRight,
  Receipt, Info, Sparkles, Calendar, Users, Zap,
} from "lucide-react";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

/* ─── Types ─── */
interface PlanFeature {
  text: string;
  included: boolean;
}

interface UsageItem {
  label: string;
  used: number;
  limit: number | null;
  icon: React.ComponentType<{ className?: string }>;
}

/* ─── Data ─── */
const USAGE: UsageItem[] = [
  { label: "Event Types", used: 1, limit: 1, icon: Calendar },
  { label: "Bookings this month", used: 12, limit: 50, icon: Users },
  { label: "Integrations", used: 1, limit: 2, icon: Zap },
];

const FREE_FEATURES: PlanFeature[] = [
  { text: "1 event type", included: true },
  { text: "Google Calendar sync", included: true },
  { text: "Email notifications", included: true },
  { text: "Custom booking link", included: true },
  { text: "Up to 50 bookings / month", included: true },
  { text: "Unlimited event types", included: false },
  { text: "Priority support", included: false },
];

const PRO_FEATURES: PlanFeature[] = [
  { text: "Unlimited event types", included: true },
  { text: "All calendar integrations", included: true },
  { text: "Zoom / Teams auto-links", included: true },
  { text: "Payment collection (Stripe)", included: true },
  { text: "Unlimited bookings", included: true },
  { text: "Custom branding", included: true },
  { text: "Priority support", included: true },
];

/* ─── Progress bar helper ─── */
function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const isHigh = pct >= 80;
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isHigh
            ? "bg-gradient-to-r from-amber-400 to-red-400"
            : "bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function BillingSection() {
  const [currentPlan] = useState<"free" | "pro">("free");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-gray-900">Billing</h2>
        <p className="text-[14px] text-gray-500 mt-1">Manage your plan and payment methods.</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0EFFF] flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#6C63FF]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-800">Current Plan</p>
            <p className="text-[12px] text-gray-400">You are on the <span className="font-semibold text-[#6C63FF]">{currentPlan === "free" ? "Free" : "Pro"}</span> plan.</p>
          </div>
          <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-[#F8F7FF] rounded-xl border border-[#6C63FF]/10">
          <Info className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
          <p className="text-[12px] text-gray-600">Your free plan renews automatically. No credit card required.</p>
        </div>
      </div>

      {/* Usage summary */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4 block" style={MONO}>Usage This Month</label>
        <div className="space-y-4">
          {USAGE.map((item) => {
            const Icon = item.icon;
            const atLimit = item.limit !== null && item.used >= item.limit;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[13px] font-bold ${atLimit ? "text-amber-500" : "text-gray-800"}`}>{item.used}</span>
                    {item.limit !== null && (
                      <>
                        <span className="text-[11px] text-gray-300">/</span>
                        <span className="text-[13px] text-gray-400">{item.limit}</span>
                      </>
                    )}
                    {atLimit && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 ml-1">Limit</span>
                    )}
                  </div>
                </div>
                {item.limit !== null && (
                  <UsageBar used={item.used} limit={item.limit} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free plan */}
        <div className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5 transition-all ${
          currentPlan === "free" ? "ring-2 ring-[#6C63FF]/20" : ""
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[16px] font-bold text-gray-800">Free</p>
            {currentPlan === "free" && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Current</span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-[28px] font-bold text-gray-900">$0</span>
            <span className="text-[13px] text-gray-400">/ month</span>
          </div>
          <div className="space-y-2.5 mb-5">
            {FREE_FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-2">
                {f.included ? (
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <CircleDot className="w-4 h-4 text-gray-200 flex-shrink-0" />
                )}
                <span className={`text-[13px] ${f.included ? "text-gray-700" : "text-gray-300"}`}>{f.text}</span>
              </div>
            ))}
          </div>
          <button
            disabled={currentPlan === "free"}
            className="w-full py-2.5 text-[13px] font-bold rounded-xl border border-gray-200 text-gray-400 bg-gray-50 cursor-default"
          >
            Current Plan
          </button>
        </div>

        {/* Pro plan */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#6C63FF]/10 to-transparent rounded-bl-[48px]" />
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[16px] font-bold text-gray-800">Pro</p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F0EFFF] text-[#6C63FF]">Popular</span>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-[28px] font-bold text-gray-900">$12</span>
            <span className="text-[13px] text-gray-400">/ month</span>
          </div>
          <div className="space-y-2.5 mb-5">
            {PRO_FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
                <span className="text-[13px] text-gray-700">{f.text}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white shadow-lg shadow-[#6C63FF]/25 hover:shadow-xl hover:shadow-[#6C63FF]/30 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" /> Upgrade to Pro
          </button>
        </div>
      </div>

      {/* Upgrade nudge card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-gray-800">Unlock your full potential</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Upgrade to Pro for unlimited event types, all integrations, payment collection, and priority support.</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-xl bg-[#6C63FF] text-white hover:bg-[#5a52e6] transition-colors flex-shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" /> Upgrade
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-[14px] font-semibold text-gray-800">Invoices</p>
        </div>
        <div className="flex items-center justify-center py-6">
          <p className="text-[13px] text-gray-400">No invoices yet. Invoices will appear here after you upgrade.</p>
        </div>
      </div>
    </div>
  );
}

// app/dashboard/settings/IntegrationsSection.tsx
// Integrations settings section — ScheduleAI design
"use client";

import { useState } from "react";
import {
  Calendar, Video, MessageSquare, CreditCard,
  Zap, RefreshCw, ToggleLeft, ToggleRight, Sparkles,
} from "lucide-react";

/* ─── Integration type ─── */
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
  status: "connected" | "available";
  detail?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync your availability and auto-create events when meetings are booked.",
    icon: Calendar,
    iconBg: "bg-[#F0EFFF]",
    iconColor: "text-[#6C63FF]",
    status: "connected",
    detail: "Synced · primary calendar",
  },
  {
    id: "outlook-calendar",
    name: "Outlook Calendar",
    description: "Connect your Microsoft 365 calendar for two-way availability sync.",
    icon: Calendar,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    status: "available",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Automatically generate Zoom meeting links for new bookings.",
    icon: Video,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    status: "available",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get instant Slack notifications when meetings are booked or cancelled.",
    icon: MessageSquare,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    status: "available",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Collect payments upfront for paid consultations and coaching sessions.",
    icon: CreditCard,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    status: "available",
  },
];

export default function IntegrationsSection() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ "google-calendar": true });

  const toggle = (id: string) => {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(connected).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-gray-900">Integrations</h2>
        <p className="text-[14px] text-gray-500 mt-1">Connect Google / Outlook calendars and other tools.</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 p-3 bg-[#F8F7FF] rounded-xl border border-[#6C63FF]/10">
        <Zap className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
        <p className="text-[12px] text-gray-600">
          <span className="font-semibold">{activeCount}</span> integration{activeCount !== 1 ? "s" : ""} active · connect more to supercharge your workflow.
        </p>
      </div>

      {/* Integration cards */}
      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => {
          const isConnected = !!connected[integration.id];
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5 transition-all ${
                isConnected ? "ring-1 ring-[#6C63FF]/15" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${integration.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${integration.iconColor}`} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-gray-800">{integration.name}</p>
                    {isConnected ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Connected</span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">Available</span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400">{integration.description}</p>
                  {isConnected && integration.detail && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <RefreshCw className="w-3 h-3 text-[#6C63FF]" />
                      <span className="text-[11px] text-[#6C63FF] font-medium">{integration.detail}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggle(integration.id)}
                  className="flex-shrink-0 mt-0.5 transition-colors"
                  aria-label={isConnected ? `Disconnect ${integration.name}` : `Connect ${integration.name}`}
                >
                  {isConnected ? (
                    <ToggleRight className="w-8 h-8 text-[#6C63FF]" strokeWidth={1.75} />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300 hover:text-gray-400" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">More integrations coming soon</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Microsoft Teams, Google Meet auto-links, Calendly import, and webhooks are on the roadmap.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

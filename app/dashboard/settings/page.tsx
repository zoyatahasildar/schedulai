// app/dashboard/settings/page.tsx
// Settings — ChronoAI design, real account data
// Owned by: Lead
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  User, Bell, Link2, Shield, CreditCard, Palette, Globe,
  Check, Copy, ExternalLink, Mail, Clock, ChevronRight, LogOut, Save, Loader2, AlertCircle,
  Calendar, Video, Plus,
} from "lucide-react";
import {
  useTimezone,
  supportedTimeZones,
  browserTimeZone,
} from "@/components/providers/TimezoneProvider";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "booking-link", label: "Booking Link", icon: Link2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "timezone", label: "Timezone", icon: Clock },
  { id: "security", label: "Account", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function initials(name?: string | null) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [tab, setTab] = useState("profile");
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-white">Settings</h1>
        <p className="text-[14px] text-white/50 mt-1">Manage your account preferences and configurations.</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-2 lg:sticky lg:top-24">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 ${tab === id ? "bg-[#6C63FF]/15 text-[#6C63FF]" : "text-white/65 hover:bg-white/[0.05] hover:text-white"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={tab === id ? 2 : 1.75} />
                <span className="text-[13px] font-semibold">{label}</span>
                {tab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "profile" && <ProfileSection user={user} />}
          {tab === "booking-link" && <BookingLinkSection user={user} origin={origin} update={update} />}
          {tab === "notifications" && <NotificationsSection />}
          {tab === "timezone" && <TimezoneSection />}
          {tab === "security" && <AccountSection user={user} />}
          {tab === "integrations" && <IntegrationsSection />}
          {tab === "billing" && <Placeholder title="Billing" desc="Manage your plan and payment methods." />}
          {tab === "appearance" && <AppearanceSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Profile</h2>
        <p className="text-[14px] text-white/50 mt-1">Your profile is synced from your Google account.</p>
      </div>
      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center gap-5 mb-6">
          {user?.image ? (
            <Image src={user.image} alt={user?.name ?? "User"} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-white text-[24px] font-bold shadow-lg shadow-[#6C63FF]/25">{initials(user?.name)}</div>
          )}
          <div>
            <p className="text-[16px] font-bold text-white">{user?.name ?? "—"}</p>
            <p className="text-[13px] text-white/50">{user?.email ?? "—"}</p>
            <p className="text-[11px] text-white/40 mt-1">Synced from Google · updates automatically</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block" style={MONO}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input value={user?.name ?? ""} readOnly className="w-full pl-9 pr-4 py-2.5 border border-white/10 rounded-xl text-[14px] bg-white/[0.04] text-white/60" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block" style={MONO}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input value={user?.email ?? ""} readOnly className="w-full pl-9 pr-4 py-2.5 border border-white/10 rounded-xl text-[14px] bg-white/[0.04] text-white/60" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 p-3 bg-[#131a2e] rounded-xl border border-[#6C63FF]/10">
          <Clock className="w-4 h-4 text-[#6C63FF] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-white/65">All meeting times are stored and shown in <span className="font-semibold">UTC</span> so you and your guests always agree on the exact time.</p>
        </div>
      </div>
    </div>
  );
}

function BookingLinkSection({ user, origin, update }: { user: any; origin: string; update: any }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (user?.username) setUsername(user.username); }, [user]);

  const link = username ? `${origin}/book/${username}` : null;

  const save = async () => {
    if (username.trim().length < 3) { setError("Username must be at least 3 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/settings/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      await update({ username: data.username });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { if (link) { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Booking Link</h2>
        <p className="text-[14px] text-white/50 mt-1">Share your personalized booking page with anyone.</p>
      </div>
      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        {link ? (
          <div className="flex items-center gap-2 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-4">
            <Link2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            <span className="flex-1 text-[13px] text-white/80 truncate" style={MONO}>{link}</span>
            <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all flex-shrink-0 ${copied ? "bg-emerald-500 text-white" : "bg-[#6C63FF] text-white hover:bg-[#5a52e6]"}`}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-amber-500/15 border border-amber-100 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-700">Choose a username below to activate your booking link.</p>
          </div>
        )}

        <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block" style={MONO}>Username</label>
        <div className="flex items-center border border-white/10 rounded-xl overflow-hidden focus-within:border-[#6C63FF] focus-within:ring-2 focus-within:ring-[#6C63FF]/15">
          <span className="px-3 py-2.5 bg-white/[0.04] text-[13px] text-white/40 border-r border-white/10 flex-shrink-0" style={MONO}>/book/</span>
          <input value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "")); setError(""); }}
            placeholder="your-name" maxLength={30} className="flex-1 px-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none bg-[#131a2e]" />
        </div>
        {error && <p className="text-[12px] text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

        <div className="flex items-center gap-3 mt-4">
          <button onClick={save} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/25 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {loading ? "Saving…" : saved ? "Saved!" : "Save Username"}
          </button>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[13px] font-bold text-[#6C63FF] hover:underline">
              <ExternalLink className="w-4 h-4" /> Open booking page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Notifications</h2>
        <p className="text-[14px] text-white/50 mt-1">What ChronoAI sends on your behalf.</p>
      </div>
      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6 space-y-4">
        {[
          { title: "Guest booking confirmation", desc: "When someone books, they automatically receive a confirmation email." },
          { title: "Host notification", desc: "You get an email each time a new booking comes in." },
        ].map((n) => (
          <div key={n.title} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
            <div>
              <p className="text-[14px] font-semibold text-white">{n.title}</p>
              <p className="text-[12px] text-white/40 mt-0.5">{n.desc}</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300">Active</span>
          </div>
        ))}
        <p className="text-[12px] text-white/40">Emails are sent through Resend. Reminder scheduling is on the roadmap.</p>
      </div>
    </div>
  );
}

function AccountSection({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Account</h2>
        <p className="text-[14px] text-white/50 mt-1">Your sign-in and session.</p>
      </div>
      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 flex items-center justify-center"><Shield className="w-5 h-5 text-[#6C63FF]" /></div>
          <div>
            <p className="text-[14px] font-semibold text-white">Signed in with Google</p>
            <p className="text-[12px] text-white/40">{user?.email ?? "—"}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/15 text-red-300 text-[13px] font-bold rounded-xl hover:bg-red-500/20 transition-colors">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>
    </div>
  );
}

type IntegrationApp = {
  name: string;
  desc: string;
  icon: typeof Calendar;
  color: string;
};

const CALENDAR_APPS: IntegrationApp[] = [
  { name: "Google Calendar", desc: "Two-way sync with your Google Calendar.", icon: Calendar, color: "#4285F4" },
  { name: "Outlook Calendar", desc: "Sync events with Microsoft Outlook.", icon: Calendar, color: "#0078D4" },
  { name: "Apple Calendar", desc: "Sync events with your iCloud Calendar.", icon: Calendar, color: "#A2AAAD" },
];

const VIDEO_APPS: IntegrationApp[] = [
  { name: "Google Meet", desc: "Auto-attach a Meet link to new bookings.", icon: Video, color: "#00897B" },
  { name: "Zoom", desc: "Auto-attach a Zoom link to new bookings.", icon: Video, color: "#2D8CFF" },
  { name: "WhatsApp Video", desc: "Share a WhatsApp video call link with guests.", icon: Video, color: "#25D366" },
];

function IntegrationCard({ app }: { app: IntegrationApp }) {
  const [connecting, setConnecting] = useState(false);
  const Icon = app.icon;

  const handleConnect = () => {
    // OAuth wiring comes later — log the intent for now.
    console.log(`[Integrations] Connect clicked: ${app.name}`);
    setConnecting(true);
    setTimeout(() => setConnecting(false), 1200);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-[#0f1629] rounded-xl border border-white/[0.06]">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${app.color}1A` }}
      >
        <Icon className="w-5 h-5" style={{ color: app.color }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-white truncate">{app.name}</p>
        <p className="text-[12px] text-white/40 truncate">{app.desc}</p>
      </div>
      <button
        type="button"
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-xl flex-shrink-0 bg-[#6C63FF]/15 text-[#6C63FF] hover:bg-[#6C63FF]/25 transition-colors disabled:opacity-60"
      >
        {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {connecting ? "Connecting…" : "Connect"}
      </button>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Integrations</h2>
        <p className="text-[14px] text-white/50 mt-1">
          Connect your calendars and video apps to ChronoAI.
        </p>
      </div>

      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-[#6C63FF]" />
          <h3 className="text-[15px] font-bold text-white">Calendars</h3>
        </div>
        <div className="space-y-3">
          {CALENDAR_APPS.map((app) => (
            <IntegrationCard key={app.name} app={app} />
          ))}
        </div>
      </div>

      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-4 h-4 text-[#6C63FF]" />
          <h3 className="text-[15px] font-bold text-white">Video apps</h3>
        </div>
        <div className="space-y-3">
          {VIDEO_APPS.map((app) => (
            <IntegrationCard key={app.name} app={app} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimezoneSection() {
  const { timezone, setTimezone, hydrated, formatInTimeZone } = useTimezone();
  const zones = useMemo(() => supportedTimeZones(), []);
  const [saved, setSaved] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // Live preview clock — only runs on the client, refreshed every 30s.
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const onSelect = (tz: string) => {
    setTimezone(tz);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const detected = browserTimeZone();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Timezone</h2>
        <p className="text-[14px] text-white/50 mt-1">
          Choose the timezone used to display dates and times across ChronoAI.
        </p>
      </div>

      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <label
          htmlFor="timezone-select"
          className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block"
          style={MONO}
        >
          Display Timezone
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <select
            id="timezone-select"
            value={timezone}
            onChange={(e) => onSelect(e.target.value)}
            disabled={!hydrated}
            className="w-full pl-9 pr-4 py-2.5 border border-white/10 rounded-xl text-[14px] bg-[#0f1629] text-white focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all disabled:opacity-60 appearance-none"
          >
            {/* Keep the current value selectable even if it's not in the list (e.g. fallback runtimes). */}
            {!zones.includes(timezone) && <option value={timezone}>{timezone}</option>}
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => onSelect(detected)}
            disabled={!hydrated || timezone === detected}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white/80 text-[13px] font-semibold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <Globe className="w-4 h-4" /> Use detected ({detected.replace(/_/g, " ")})
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-300">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>

        <div className="mt-5 p-3 bg-[#0f1629] rounded-xl border border-white/[0.06]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1" style={MONO}>
            Current time in {timezone.replace(/_/g, " ")}
          </p>
          <p className="text-[15px] font-semibold text-white" style={MONO}>
            {now
              ? formatInTimeZone(now, { dateStyle: "full", timeStyle: "long" })
              : "—"}
          </p>
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-[#131a2e] rounded-xl border border-[#6C63FF]/10">
          <Clock className="w-4 h-4 text-[#6C63FF] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-white/65">
            All meeting times are stored in <span className="font-semibold">UTC</span>. This setting
            only changes how times are displayed to you — your guests still see times in their own
            timezone.
          </p>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">{title}</h2>
        <p className="text-[14px] text-white/50 mt-1">{desc}</p>
      </div>
      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/15 flex items-center justify-center mb-4"><Palette className="w-8 h-8 text-[#6C63FF]" strokeWidth={1.5} /></div>
        <p className="text-[16px] font-bold text-white mb-2">{title} — coming soon</p>
        <p className="text-[13px] text-white/40 max-w-xs">This section isn&apos;t wired to a backend yet, so it&apos;s hidden rather than showing placeholder data.</p>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-white">Appearance</h2>
        <p className="text-[14px] text-white/50 mt-1">Theme, layout, and brand colour preferences.</p>
      </div>
      <div className="bg-[#131a2e] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4FF]/20 border border-[#6C63FF]/20 flex items-center justify-center">
          <Palette className="w-8 h-8 text-[#6C63FF]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[16px] font-bold text-white mb-1">Customise your experience</p>
          <p className="text-[13px] text-white/40 max-w-xs">Set your dashboard theme, booking page theme, calendar layout, and brand colours.</p>
        </div>
        <button
          onClick={() => router.push("/settings/appearance")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/25 hover:scale-[1.02] transition-transform"
        >
          <Palette className="w-4 h-4" />
          Open Appearance Settings
        </button>
      </div>
    </div>
  );
}

// app/settings/appearance/page.tsx
// Appearance Settings — ChronoAI
// Owned by: Lead (Appearance module)

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Palette, Monitor, Sun, Moon, Calendar, LayoutGrid, Rows, Loader2, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAppearanceStore, type Theme, type Layout } from "@/store/appearanceStore";

// ─── Toast ────────────────────────────────────────────────────
type ToastVariant = "success" | "error";
interface ToastState { visible: boolean; message: string; variant: ToastVariant }

function Toast({ state }: { state: ToastState }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-[13px] font-semibold transition-all duration-300 ${
        state.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      } ${
        state.variant === "success"
          ? "bg-emerald-500 text-white shadow-emerald-500/25"
          : "bg-red-500 text-white shadow-red-500/25"
      }`}
    >
      {state.variant === "success" ? <Check className="w-4 h-4" /> : null}
      {state.message}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────
function Section({ title, desc, icon: Icon, children }: {
  title: string; desc: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#6C63FF]" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-white leading-tight">{title}</h2>
          <p className="text-[12px] text-white/45 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="bg-[#131a2e] rounded-2xl border border-white/[0.05] p-5">
        {children}
      </div>
    </div>
  );
}

// ─── Radio option card ────────────────────────────────────────
function RadioOption({ value, label, sublabel, icon: Icon }: {
  value: string; label: string; sublabel?: string; icon: React.ElementType
}) {
  return (
    <label
      htmlFor={`radio-${value}`}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-[#0f1629] hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/[0.04] transition-all cursor-pointer group has-[input:checked]:border-[#6C63FF] has-[input:checked]:bg-[#6C63FF]/[0.08]"
    >
      <RadioGroupItem value={value} id={`radio-${value}`} className="border-white/30 text-[#6C63FF]" />
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-[#6C63FF]/15 transition-colors">
        <Icon className="w-4 h-4 text-white/60" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-white">{label}</p>
        {sublabel && <p className="text-[11px] text-white/40 mt-0.5">{sublabel}</p>}
      </div>
    </label>
  );
}

// ─── Colour picker row ────────────────────────────────────────
function ColorRow({ id, label, sublabel, value, onChange }: {
  id: string; label: string; sublabel: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-white">{label}</p>
        <p className="text-[11px] text-white/40 mt-0.5">{sublabel}</p>
      </div>
      <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
        <span className="text-[12px] font-mono text-white/50 group-hover:text-white/80 transition-colors uppercase">
          {value}
        </span>
        <div className="relative">
          <div
            className="w-10 h-10 rounded-xl border-2 border-white/10 shadow-lg shadow-black/30 group-hover:scale-105 transition-transform"
            style={{ backgroundColor: value }}
          />
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      </label>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AppearancePage() {
  const router = useRouter();
  const { dashboardTheme, bookingTheme, bookingLayout, brandColorLight, brandColorDark, hydrated, load, set } =
    useAppearanceStore();

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", variant: "success" });

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    setToast({ visible: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  // ── Load preferences on mount ──
  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          load({
            dashboardTheme: res.data.dashboardTheme ?? "system",
            bookingTheme: res.data.bookingTheme ?? "system",
            bookingLayout: res.data.bookingLayout ?? "month",
            brandColorLight: res.data.brandColorLight ?? "#292929",
            brandColorDark: res.data.brandColorDark ?? "#d0ac8a",
          });
        }
      })
      .catch(() => {/* non-fatal — defaults already in store */});
  }, [load]);

  // ── Save handler ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardTheme, bookingTheme, bookingLayout, brandColorLight, brandColorDark }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to save preferences", "error");
      } else {
        showToast("Appearance preferences saved!");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8 md:px-10">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-2 text-[13px] text-white/50 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Settings
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF]/30 to-[#00D4FF]/20 border border-[#6C63FF]/20 flex items-center justify-center shadow-lg shadow-[#6C63FF]/10">
            <Palette className="w-6 h-6 text-[#6C63FF]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white">Appearance</h1>
            <p className="text-[13px] text-white/45 mt-0.5">Customise how EdOra looks for you and your guests.</p>
          </div>
        </div>

        {/* Loading skeleton */}
        {!hydrated ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-[#131a2e] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1 — Dashboard Theme */}
            <Section title="Dashboard Theme" desc="Controls the colour scheme of your EdOra dashboard." icon={Monitor}>
              <RadioGroup
                value={dashboardTheme}
                onValueChange={(v) => set("dashboardTheme", v as Theme)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              >
                <RadioOption value="system" label="System default" sublabel="Follows OS setting" icon={Monitor} />
                <RadioOption value="light" label="Light" sublabel="Always light mode" icon={Sun} />
                <RadioOption value="dark" label="Dark" sublabel="Always dark mode" icon={Moon} />
              </RadioGroup>
            </Section>

            {/* 2 — Booking Page Theme */}
            <Section title="Booking Page Theme" desc="Controls what your guests see when they visit your booking link." icon={Sun}>
              <RadioGroup
                value={bookingTheme}
                onValueChange={(v) => set("bookingTheme", v as Theme)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              >
                <RadioOption value="system" label="System default" sublabel="Follows visitor's OS" icon={Monitor} />
                <RadioOption value="light" label="Light" sublabel="Always light mode" icon={Sun} />
                <RadioOption value="dark" label="Dark" sublabel="Always dark mode" icon={Moon} />
              </RadioGroup>
            </Section>

            {/* 3 — Booking Layout */}
            <Section title="Booking Layout" desc="The calendar view your guests use when picking a time slot." icon={Calendar}>
              <RadioGroup
                value={bookingLayout}
                onValueChange={(v) => set("bookingLayout", v as Layout)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              >
                <RadioOption value="month" label="Month" sublabel="Full month grid (default)" icon={Calendar} />
                <RadioOption value="week" label="Weekly" sublabel="7-day rolling view" icon={LayoutGrid} />
                <RadioOption value="day" label="Column" sublabel="Day-by-day columns" icon={Rows} />
              </RadioGroup>
            </Section>

            {/* 4 — Brand Colours */}
            <Section
              title="Custom Brand Colours"
              desc="The accent colour applied across your booking page for both themes."
              icon={Palette}
            >
              <ColorRow
                id="brand-color-light"
                label="Light theme accent"
                sublabel="Used when booking page is in light mode"
                value={brandColorLight}
                onChange={(v) => set("brandColorLight", v)}
              />
              <ColorRow
                id="brand-color-dark"
                label="Dark theme accent"
                sublabel="Used when booking page is in dark mode"
                value={brandColorDark}
                onChange={(v) => set("brandColorDark", v)}
              />

              {/* Live preview pill */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/30">Preview</span>
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-bold"
                  style={{ backgroundColor: brandColorLight, color: "#fff" }}
                >
                  Light accent
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-bold"
                  style={{ backgroundColor: brandColorDark, color: "#fff" }}
                >
                  Dark accent
                </span>
              </div>
            </Section>

            {/* Save button */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[12px] text-white/35">Changes are applied immediately after saving.</p>
              <button
                onClick={handleSave}
                disabled={saving}
                id="save-appearance-btn"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#6C63FF]/25 hover:shadow-[#6C63FF]/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Appearance"}
              </button>
            </div>

          </div>
        )}
      </div>

      <Toast state={toast} />
    </div>
  );
}

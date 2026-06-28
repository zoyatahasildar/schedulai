// app/dashboard/settings/AppearanceSection.tsx
// Appearance settings section — ScheduleAI design
"use client";

import { useState, useCallback } from "react";
import {
  Sun, Moon, Monitor, Type, Eye, Palette, Check, Save,
  ToggleLeft, ToggleRight, RotateCcw, Columns, Rows, Calendar,
  Bell,
} from "lucide-react";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

/* ─── Types ─── */
interface ThemeOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  previewBg: string;
  previewSidebar: string;
  previewContent: string;
  previewAccent: string;
}

interface AccentColor {
  id: string;
  label: string;
  value: string;
  ring: string;
}

interface DensityOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

/* ─── Data ─── */
const THEMES: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    previewBg: "bg-gray-50",
    previewSidebar: "bg-white",
    previewContent: "bg-white",
    previewAccent: "bg-[#6C63FF]",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    previewBg: "bg-gray-900",
    previewSidebar: "bg-gray-800",
    previewContent: "bg-gray-800",
    previewAccent: "bg-[#6C63FF]",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    previewBg: "bg-gradient-to-br from-gray-50 to-gray-900",
    previewSidebar: "bg-gradient-to-b from-white to-gray-800",
    previewContent: "bg-gradient-to-b from-white to-gray-800",
    previewAccent: "bg-[#6C63FF]",
  },
];

const ACCENT_COLORS: AccentColor[] = [
  { id: "purple", label: "Purple", value: "bg-[#6C63FF]", ring: "ring-[#6C63FF]" },
  { id: "cyan", label: "Cyan", value: "bg-[#00D4FF]", ring: "ring-[#00D4FF]" },
  { id: "emerald", label: "Emerald", value: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "rose", label: "Rose", value: "bg-rose-500", ring: "ring-rose-500" },
  { id: "amber", label: "Amber", value: "bg-amber-500", ring: "ring-amber-500" },
  { id: "indigo", label: "Indigo", value: "bg-indigo-500", ring: "ring-indigo-500" },
];

const FONT_SIZES = [
  { id: "small", label: "Small", sample: "text-[12px]" },
  { id: "medium", label: "Medium", sample: "text-[14px]" },
  { id: "large", label: "Large", sample: "text-[16px]" },
];

const DENSITIES: DensityOption[] = [
  { id: "comfortable", label: "Comfortable", description: "More spacing, easier to scan", icon: Rows },
  { id: "compact", label: "Compact", description: "Tighter layout, more on screen", icon: Columns },
];

/* ─── Defaults ─── */
const DEFAULTS = {
  theme: "light",
  accent: "purple",
  fontSize: "medium",
  density: "comfortable",
  compactMode: false,
  reducedMotion: false,
};

/* ─── Component ─── */
export default function AppearanceSection() {
  const [theme, setTheme] = useState(DEFAULTS.theme);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
  const [density, setDensity] = useState(DEFAULTS.density);
  const [compactMode, setCompactMode] = useState(DEFAULTS.compactMode);
  const [reducedMotion, setReducedMotion] = useState(DEFAULTS.reducedMotion);
  const [saved, setSaved] = useState(false);

  const resetAll = useCallback(() => {
    setTheme(DEFAULTS.theme);
    setAccent(DEFAULTS.accent);
    setFontSize(DEFAULTS.fontSize);
    setDensity(DEFAULTS.density);
    setCompactMode(DEFAULTS.compactMode);
    setReducedMotion(DEFAULTS.reducedMotion);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, []);

  const activeAccent = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];
  const activeFont = FONT_SIZES.find((f) => f.id === fontSize) ?? FONT_SIZES[1];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-gray-900">Appearance</h2>
        <p className="text-[14px] text-gray-500 mt-1">Theme, language, and display preferences.</p>
      </div>

      {/* ── Theme selection with preview thumbnails ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 block" style={MONO}>Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ id, label, icon: Icon, previewBg, previewSidebar, previewContent, previewAccent }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                theme === id
                  ? "border-[#6C63FF] bg-[#F8F7FF] shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
              }`}
              aria-label={`Select ${label} theme`}
            >
              {/* Preview thumbnail */}
              <div className={`w-full aspect-[4/3] rounded-lg ${previewBg} p-1.5 overflow-hidden`}>
                <div className="w-full h-full rounded flex gap-0.5">
                  <div className={`w-1/4 ${previewSidebar} rounded-sm`}>
                    <div className={`w-3/4 h-1 ${previewAccent} rounded-full mt-1.5 mx-auto`} />
                    <div className="space-y-0.5 mt-1 px-0.5">
                      <div className={`w-full h-0.5 rounded-full ${id === "dark" ? "bg-gray-600" : "bg-gray-200"}`} />
                      <div className={`w-3/4 h-0.5 rounded-full ${id === "dark" ? "bg-gray-600" : "bg-gray-200"}`} />
                      <div className={`w-full h-0.5 rounded-full ${id === "dark" ? "bg-gray-600" : "bg-gray-200"}`} />
                    </div>
                  </div>
                  <div className={`flex-1 ${previewContent} rounded-sm p-1`}>
                    <div className={`w-2/3 h-1 rounded-full ${id === "dark" ? "bg-gray-600" : "bg-gray-200"} mb-1`} />
                    <div className={`w-full h-3 rounded ${id === "dark" ? "bg-gray-700" : "bg-gray-100"} mb-0.5`} />
                    <div className={`w-full h-3 rounded ${id === "dark" ? "bg-gray-700" : "bg-gray-100"}`} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${theme === id ? "text-[#6C63FF]" : "text-gray-400"}`} strokeWidth={1.75} />
                <span className={`text-[13px] font-semibold ${theme === id ? "text-[#6C63FF]" : "text-gray-500"}`}>{label}</span>
              </div>
              {theme === id && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#6C63FF] text-white">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Accent color palette ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-400" />
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block" style={MONO}>Accent Color</label>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setAccent(color.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                accent === color.id
                  ? `border-current ${color.ring} ring-2 ring-offset-1 bg-gray-50`
                  : "border-gray-100 hover:border-gray-200"
              }`}
              aria-label={`Select ${color.label} accent color`}
            >
              <div className={`w-5 h-5 rounded-full ${color.value} flex items-center justify-center flex-shrink-0`}>
                {accent === color.id && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-[12px] font-semibold ${accent === color.id ? "text-gray-800" : "text-gray-500"}`}>{color.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Font Size ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-gray-400" />
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block" style={MONO}>Font Size</label>
        </div>
        <div className="flex gap-2">
          {FONT_SIZES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFontSize(id)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                fontSize === id
                  ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/25"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
              }`}
              aria-label={`Set font size to ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interface Density ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 block" style={MONO}>Interface Density</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DENSITIES.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDensity(id)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                density === id
                  ? "border-[#6C63FF] bg-[#F8F7FF] shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
              }`}
              aria-label={`Set density to ${label}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                density === id ? "bg-[#F0EFFF]" : "bg-gray-50"
              }`}>
                <Icon className={`w-4.5 h-4.5 ${density === id ? "text-[#6C63FF]" : "text-gray-400"}`} strokeWidth={1.75} />
              </div>
              <div>
                <p className={`text-[13px] font-semibold ${density === id ? "text-[#6C63FF]" : "text-gray-700"}`}>{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
              </div>
              {density === id && (
                <Check className="w-4 h-4 text-[#6C63FF] ml-auto flex-shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toggles: Compact Mode & Reduced Motion ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 block" style={MONO}>Accessibility</label>
        <div className="space-y-1">
          {/* Compact mode */}
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Columns className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-800">Compact mode</p>
                <p className="text-[12px] text-gray-400">Reduce padding and spacing across the UI.</p>
              </div>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className="flex-shrink-0 transition-colors"
              aria-label={compactMode ? "Disable compact mode" : "Enable compact mode"}
            >
              {compactMode ? (
                <ToggleRight className="w-8 h-8 text-[#6C63FF]" strokeWidth={1.75} />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300 hover:text-gray-400" strokeWidth={1.75} />
              )}
            </button>
          </div>

          {/* Reduced motion */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-800">Reduce motion</p>
                <p className="text-[12px] text-gray-400">Minimise animations throughout the interface.</p>
              </div>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className="flex-shrink-0 transition-colors"
              aria-label={reducedMotion ? "Disable reduced motion" : "Enable reduced motion"}
            >
              {reducedMotion ? (
                <ToggleRight className="w-8 h-8 text-[#6C63FF]" strokeWidth={1.75} />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300 hover:text-gray-400" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Preview Card ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-6">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 block" style={MONO}>Preview</label>
        <div className={`rounded-xl border-2 border-gray-100 overflow-hidden ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}>
          {/* Preview header */}
          <div className={`px-4 ${density === "compact" ? "py-2" : "py-3"} border-b ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${activeAccent.value} flex items-center justify-center`}>
                  <Calendar className="w-3 h-3 text-white" strokeWidth={2} />
                </div>
                <span className={`font-bold ${activeFont.sample} ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}>ScheduleAI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-md ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                } flex items-center justify-center`}>
                  <Bell className={`w-3 h-3 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`} />
                </div>
                <div className={`w-5 h-5 rounded-full ${activeAccent.value}`} />
              </div>
            </div>
          </div>
          {/* Preview body */}
          <div className={`px-4 ${density === "compact" ? "py-3" : "py-4"}`}>
            <div className={`font-bold mb-1 ${activeFont.sample} ${
              theme === "dark" ? "text-gray-100" : "text-gray-800"
            }`}>Upcoming meetings</div>
            <p className={`text-[11px] mb-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Your schedule for today</p>
            <div className="space-y-2">
              {[
                { time: "9:00 AM", title: "Design Review", tag: "30 min" },
                { time: "2:00 PM", title: "Team Standup", tag: "15 min" },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-3 rounded-lg ${density === "compact" ? "p-2" : "p-2.5"} ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className={`w-1 self-stretch rounded-full ${activeAccent.value}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      fontSize === "small" ? "text-[11px]" : fontSize === "large" ? "text-[14px]" : "text-[12px]"
                    } ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>{item.title}</p>
                    <p className={`text-[10px] ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{item.time}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"
                  }`}>{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 text-center">Live preview of your selected preferences</p>
      </div>

      {/* ── Actions: Reset + Save ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors"
          aria-label="Reset to default preferences"
        >
          <RotateCcw className="w-4 h-4" /> Reset to Default
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-xl shadow-lg transition-all ${
            saved
              ? "bg-emerald-500 text-white shadow-emerald-500/25"
              : "bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white shadow-[#6C63FF]/25 hover:shadow-xl hover:shadow-[#6C63FF]/30"
          }`}
          aria-label="Save appearance preferences"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 bg-[#F8F7FF] rounded-xl border border-[#6C63FF]/10">
        <Palette className="w-4 h-4 text-[#6C63FF] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-gray-600">Appearance preferences are saved locally. Dark mode and language switching are on the roadmap.</p>
      </div>
    </div>
  );
}

// store/appearanceStore.ts
// Zustand store for appearance preferences
// Owned by: Lead (Appearance settings)

import { create } from "zustand";

export type Theme = "system" | "light" | "dark";
export type Layout = "month" | "week" | "day";

export interface AppearancePrefs {
  dashboardTheme: Theme;
  bookingTheme: Theme;
  bookingLayout: Layout;
  brandColorLight: string;
  brandColorDark: string;
}

interface AppearanceState extends AppearancePrefs {
  hydrated: boolean;
  /** Replace all prefs at once (e.g. after a GET /api/user/preferences). */
  load: (prefs: Partial<AppearancePrefs>) => void;
  /** Update a single field. */
  set: <K extends keyof AppearancePrefs>(key: K, value: AppearancePrefs[K]) => void;
}

const DEFAULTS: AppearancePrefs = {
  dashboardTheme: "system",
  bookingTheme: "system",
  bookingLayout: "month",
  brandColorLight: "#292929",
  brandColorDark: "#d0ac8a",
};

export const useAppearanceStore = create<AppearanceState>((setState) => ({
  ...DEFAULTS,
  hydrated: false,

  load: (prefs) =>
    setState((s) => ({
      ...s,
      ...prefs,
      hydrated: true,
    })),

  set: (key, value) =>
    setState((s) => ({ ...s, [key]: value })),
}));

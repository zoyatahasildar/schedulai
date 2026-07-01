// components/Providers.tsx
// Wraps the app with SessionProvider for NextAuth + TimezoneProvider for the
// user's display timezone preference.
// Owned by: Lead

"use client";

import { SessionProvider } from "next-auth/react";
import { TimezoneProvider } from "@/components/providers/TimezoneProvider";
import { useAppearanceStore } from "@/store/appearanceStore";
import { useEffect } from "react";

function ThemeApplier() {
  const { dashboardTheme, brandColorLight, brandColorDark } = useAppearanceStore();

  // Load saved preferences into the store on mount
  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const dbTheme = res.data.dashboardTheme ?? "system";
          const localTheme = localStorage.getItem("chronoai-public-theme");

          if (localTheme && localTheme !== dbTheme && (localTheme === "light" || localTheme === "dark" || localTheme === "system")) {
            // User had a different theme selected in public view, sync to DB
            fetch("/api/user/preferences", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dashboardTheme: localTheme }),
            }).catch(() => {});

            useAppearanceStore.getState().load({
              dashboardTheme:  localTheme as any,
              bookingTheme:    res.data.bookingTheme    ?? "system",
              bookingLayout:   res.data.bookingLayout   ?? "month",
              brandColorLight: res.data.brandColorLight ?? "#6C63FF",
              brandColorDark:  res.data.brandColorDark  ?? "#6C63FF",
            });
          } else {
            useAppearanceStore.getState().load({
              dashboardTheme:  dbTheme,
              bookingTheme:    res.data.bookingTheme    ?? "system",
              bookingLayout:   res.data.bookingLayout   ?? "month",
              brandColorLight: res.data.brandColorLight ?? "#6C63FF",
              brandColorDark:  res.data.brandColorDark  ?? "#6C63FF",
            });
          }
        } else {
          const localTheme = localStorage.getItem("chronoai-public-theme");
          if (localTheme === "light" || localTheme === "dark" || localTheme === "system") {
            useAppearanceStore.getState().set("dashboardTheme", localTheme as any);
          }
        }
      })
      .catch(() => {
        const localTheme = localStorage.getItem("chronoai-public-theme");
        if (localTheme === "light" || localTheme === "dark" || localTheme === "system") {
          useAppearanceStore.getState().set("dashboardTheme", localTheme as any);
        }
      });
  }, []);

  // Apply theme class + dynamic brand accent overrides
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (theme: string): "light" | "dark" => {
      root.classList.remove("light", "dark");
      if (theme === "dark")  { root.classList.add("dark");  return "dark";  }
      if (theme === "light") { root.classList.add("light"); return "light"; }
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(sys);
      return sys;
    };

    const buildStyles = (resolved: "light" | "dark") => {
      const accent = resolved === "dark" ? brandColorDark : brandColorLight;

      // Brand accent CSS overrides — remaps compiled #6C63FF classes to user's chosen color
      return `
        .bg-\\[\\#6C63FF\\]   { background-color: ${accent} !important; }
        .text-\\[\\#6C63FF\\] { color: ${accent} !important; }
        .border-\\[\\#6C63FF\\] { border-color: ${accent} !important; }
        .shadow-\\[\\#6C63FF\\]\\/30 { --tw-shadow-color: ${accent}4d !important; }
        .shadow-\\[\\#6C63FF\\]\\/25 { --tw-shadow-color: ${accent}40 !important; }
        .shadow-\\[\\#6C63FF\\]\\/20 { --tw-shadow-color: ${accent}33 !important; }
        .bg-\\[\\#6C63FF\\]\\/15  { background-color: ${accent}26 !important; }
        .bg-\\[\\#6C63FF\\]\\/25  { background-color: ${accent}40 !important; }
        .bg-\\[\\#6C63FF\\]\\/20  { background-color: ${accent}33 !important; }
        .hover\\:bg-\\[\\#6C63FF\\]\\/25:hover { background-color: ${accent}40 !important; }
        .hover\\:bg-\\[\\#6C63FF\\]\\/20:hover { background-color: ${accent}33 !important; }
        .hover\\:border-\\[\\#6C63FF\\]\\/40:hover { border-color: ${accent}66 !important; }
        .has-\\[input\\:checked\\]\\:bg-\\[\\#6C63FF\\]\\/\\[0\\.08\\]:has(input:checked) { background-color: ${accent}14 !important; }
        .has-\\[input\\:checked\\]\\:border-\\[\\#6C63FF\\]:has(input:checked) { border-color: ${accent} !important; }
        .focus\\:ring-\\[\\#6C63FF\\]\\/15:focus { --tw-ring-color: ${accent}26 !important; }
        .focus\\:border-\\[\\#6C63FF\\]:focus { border-color: ${accent} !important; }
        .focus\\:ring-\\[\\#6C63FF\\]:focus { --tw-ring-color: ${accent} !important; }
        .from-\\[\\#6C63FF\\] {
          --tw-gradient-from: ${accent} var(--tw-gradient-from-position) !important;
          --tw-gradient-to:   ${accent}00 var(--tw-gradient-to-position) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }
        :root { --brand-accent: ${accent} !important; }
      `;
    };

    const currentTheme = applyTheme(dashboardTheme);

    const styleEl =
      document.getElementById("dynamic-brand-styles") ||
      document.createElement("style");
    styleEl.id = "dynamic-brand-styles";
    styleEl.innerHTML = buildStyles(currentTheme);
    if (!styleEl.parentNode) document.head.appendChild(styleEl);

    // Watch system preference changes when in "system" mode
    if (dashboardTheme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        const sys: "light" | "dark" = e.matches ? "dark" : "light";
        root.classList.add(sys);
        const el = document.getElementById("dynamic-brand-styles");
        if (el) el.innerHTML = buildStyles(sys);
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [dashboardTheme, brandColorLight, brandColorDark]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>
        <ThemeApplier />
        {children}
      </TimezoneProvider>
    </SessionProvider>
  );
}

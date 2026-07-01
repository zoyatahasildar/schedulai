// app/login/page.tsx
// Owned by: Lead (Auth module)
// Login + Sign up — Google OAuth (one button serves both new and returning users)

"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Zap, Chrome, Check, Sun, Moon } from "lucide-react";
import { useAppearanceStore } from "@/store/appearanceStore";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const { dashboardTheme, set } = useAppearanceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme =
    dashboardTheme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : dashboardTheme;

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    set("dashboardTheme", nextTheme);
    localStorage.setItem("chronoai-public-theme", nextTheme);
  };

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "login") setMode("login");
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="public-page min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-[#0b1020] dark:via-[#0b1020] dark:to-[#0f1629] flex items-center justify-center px-4 transition-colors duration-300 relative">
      {/* Theme Toggle Button */}
      {mounted && (
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="absolute top-6 right-6 w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 bg-white/50 dark:bg-[#0b1020]/50 transition text-[#1a1a2e] dark:text-white"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      )}

      <div className="bg-white dark:bg-[#131a2e] rounded-2xl shadow-xl border border-violet-100 dark:border-white/[0.05] p-8 w-full max-w-md transition-colors duration-300">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-md shadow-[#6C63FF]/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Chrono<span className="text-[#6C63FF]">AI</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {isSignup ? "Create your free account" : "Welcome back"}
        </h1>
        <p className="text-gray-500 dark:text-white/60 text-center mb-8 text-sm">
          {isSignup
            ? "Sign up in one click — no password needed."
            : "Log in to manage your schedule and bookings."}
        </p>

        {/* Google button (same action for sign up + log in) */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 font-medium text-gray-700 dark:text-white hover:border-violet-300 hover:bg-violet-50 dark:hover:border-white/20 dark:hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-violet-600 dark:border-white/60 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Chrome className="w-5 h-5" />
          )}
          {loading ? "Please wait…" : "Continue with Google"}
        </button>

        {/* Free perks (sign-up only) */}
        {isSignup && (
          <ul className="mt-5 space-y-1.5">
            {[
              "Free forever — no credit card",
              "Unlimited booking links",
              "AI assistant included",
            ].map((p) => (
              <li key={p} className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-white/70">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {p}
              </li>
            ))}
          </ul>
        )}

        {/* Switch between sign up / log in */}
        <p className="text-[13px] text-gray-500 dark:text-white/60 text-center mt-6">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="font-semibold text-[#6C63FF] dark:text-[#9aa0ff] hover:underline">
                Log in
              </button>
            </>
          ) : (
            <>
              New to EdOra?{" "}
              <button onClick={() => setMode("signup")} className="font-semibold text-[#6C63FF] dark:text-[#9aa0ff] hover:underline">
                Create a free account
              </button>
            </>
          )}
        </p>

        <p className="text-xs text-gray-400 dark:text-white/45 text-center mt-4">
          {isSignup
            ? "Continuing with Google creates your account automatically."
            : "By continuing you agree to our Terms & Privacy Policy."}
        </p>
      </div>
    </div>
  );
}

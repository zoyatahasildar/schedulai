// app/login/page.tsx
// Owned by: Lead (Auth module)
// Login page — Google OAuth only

"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Chrome } from "lucide-react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-violet-100 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-violet-700">ChronoAI</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Welcome back
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Sign in to manage your schedule and bookings
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Chrome className="w-5 h-5" />
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

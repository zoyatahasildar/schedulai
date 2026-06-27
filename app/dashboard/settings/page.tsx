// app/dashboard/settings/page.tsx
// Profile & username settings page
// Owned by: Lead

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Link2, Save, Check, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  // Set initial values once session loads
  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
    }
    setOrigin(window.location.origin);
  }, [session]);

  const bookingUrl = username ? `${origin}/book/${username}` : null;

  const handleUsernameChange = (val: string) => {
    // Auto-format: lowercase, only valid chars
    setUsername(val.toLowerCase().replace(/[^a-z0-9-_]/g, ""));
    setError("");
    setSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settings/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }

      // Update session so navbar reflects new username
      await update({ username: data.username });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your profile and public booking link
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-violet-600" />
          <h2 className="font-semibold text-gray-900">Your Profile</h2>
        </div>

        {/* Avatar + name from Google */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={56}
              height={56}
              className="rounded-full border-2 border-violet-100"
            />
          ) : (
            <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-violet-500" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{session?.user?.name}</p>
            <p className="text-sm text-gray-400">{session?.user?.email}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Synced from Google — name and photo update automatically
            </p>
          </div>
        </div>

        {/* Username form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Sets your public booking URL. Lowercase letters, numbers, hyphens, underscores only.
            </p>
            <div className="flex items-stretch">
              <span className="flex items-center text-sm text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg px-3 whitespace-nowrap">
                /book/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="your-username"
                maxLength={30}
                className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {username.length}/30
            </p>
          </div>

          {/* Booking URL preview */}
          {bookingUrl && (
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <p className="text-sm text-violet-700 font-mono truncate">{bookingUrl}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Username saved! Your booking link is ready to share.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

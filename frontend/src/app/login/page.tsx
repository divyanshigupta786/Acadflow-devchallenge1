"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, UserCheck } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { HeritageMark } from "@/components/HeritageMark";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@acadflow.dev");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.login(email, password);
      ApiClient.setToken(res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.demoLogin();
      ApiClient.setToken(res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Ambient Looping Video Artwork */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-20 dark:opacity-15 overflow-hidden" aria-hidden="true">
        <video
          className="w-full h-full object-cover object-bottom filter blur-[2px] dark:invert dark:hue-rotate-180"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-card/90 backdrop-blur-md border border-primary/25 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto shadow-sm">
            <HeritageMark className="w-7 h-auto text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Welcome to AcadFlow</h2>
          <p className="text-xs text-primary/80 font-mono">From academic chaos to clarity</p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full p-4 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-semibold flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <div className="font-bold text-sm">1-Click Demo Student Access</div>
              <div className="text-[11px] text-foreground/70">Pre-loaded with 5 courses, 12 tasks &amp; schedule</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-3 text-[10px] uppercase font-mono text-foreground/60">Or sign in with email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-background/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-background/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-cream font-medium text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-foreground/75">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

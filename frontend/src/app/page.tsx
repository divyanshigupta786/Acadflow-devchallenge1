"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Layers,
  Inbox,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Play,
  Lock,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { HeritageMark } from "@/components/HeritageMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeritageFooter } from "@/components/HeritageFooter";

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemoLogin = async () => {
    setLoadingDemo(true);
    try {
      const res = await ApiClient.demoLogin();
      ApiClient.setToken(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      router.push("/login");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-cream transition-colors duration-300">
      {/* Top Header */}
      <header className="border-b border-border/80 sticky top-0 z-40 bg-background/85 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-sm">
              <HeritageMark className="w-6 h-auto text-primary" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-tight text-foreground block leading-tight">
                AcadFlow
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-primary font-semibold block">
                AI Academic OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Sign In
            </Link>
            <button
              onClick={handleDemoLogin}
              disabled={loadingDemo}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-cream hover:bg-primary/90 shadow-sm shadow-primary/25 transition-all flex items-center gap-1.5"
            >
              <span>{loadingDemo ? "Launching..." : "Launch Demo"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Ambient Teal Ink Landscape */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 text-center">
        {/* Subtle Ambient Video Glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-25 dark:opacity-20 overflow-hidden" aria-hidden="true">
          <video
            className="w-full h-full object-cover object-center filter blur-[1px] dark:invert dark:hue-rotate-180"
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold backdrop-blur-sm">
            <HeritageMark className="w-3.5 h-auto text-primary" />
            <span>AI Academic Operating System &amp; Adaptive Replanning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
            From academic chaos <br className="hidden sm:block" />
            <span className="italic text-primary">to crystalline clarity.</span>
          </h1>

          <p className="text-base sm:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
            Designed for college &amp; university students managing multiple courses, assignments, exams, and team projects. Transform fragmented academic information into an adaptive, personalized action plan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={handleDemoLogin}
              disabled={loadingDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-cream font-medium text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <span>{loadingDemo ? "Accessing Demo Account..." : "Launch Pre-loaded Demo Student"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-primary/30 bg-card/75 hover:bg-muted font-medium text-sm transition-all text-foreground"
            >
              Sign In with Account
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-foreground/80 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero Hallucinated Deadlines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Open-Source LLMs (Ollama / Qwen / Llama)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" />
              <span>100% Local &amp; Privacy-First</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Loop Section */}
      <section className="py-20 border-y border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-2 mb-14">
            <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">
              Product Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-foreground">
              INPUT → UNDERSTAND → PRIORITIZE → PLAN → REPLAN
            </h2>
            <p className="text-sm text-foreground/75 max-w-xl mx-auto">
              Not another generic chatbot. A specialized decision and planning operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                name: "Input",
                desc: "Paste raw announcements, upload syllabus PDFs, or voice-dictate assignment requirements.",
                icon: Inbox,
              },
              {
                step: "02",
                name: "Understand",
                desc: "Open-source LLMs extract structured tasks, course mappings, and verified explicit deadlines.",
                icon: Cpu,
              },
              {
                step: "03",
                name: "Prioritize",
                desc: "Deterministic backend math assigns RED/ORANGE/YELLOW/GREEN urgency without hallucination.",
                icon: Layers,
              },
              {
                step: "04",
                name: "Plan",
                desc: "Generate focus blocks within your available study hour budget with cognitive breaks.",
                icon: Calendar,
              },
              {
                step: "05",
                name: "Replan",
                desc: "Lost 2 hours? The engine safely shifts low-priority tasks while preserving exam prep.",
                icon: RefreshCw,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  className="rounded-2xl border border-border bg-card/80 p-5 space-y-3 shadow-sm hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-primary font-bold">{card.step}</span>
                    <Icon className="h-4 w-4 text-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {card.name}
                  </h3>
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Signature Feature: Adaptive Replanning Highlight */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-primary/25 bg-card/90 p-8 sm:p-12 shadow-xl shadow-primary/5 relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Signature Feature</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-medium text-foreground tracking-tight">
            Adaptive Replanning when life happens
          </h2>

          <p className="text-foreground/80 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
            When you report <span className="italic font-medium text-foreground">&quot;I only completed 45 minutes of DBMS&quot;</span> or <span className="italic font-medium text-foreground">&quot;I lost 2 hours today&quot;</span>, AcadFlow does not leave you with broken red checkboxes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
              <div className="text-xs font-semibold text-primary uppercase font-mono">
                1. Impact Calculation
              </div>
              <p className="text-xs text-foreground/75 leading-relaxed">
                Calculates remaining workload, checks available time today, and dynamically recomputes priority scores.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
              <div className="text-xs font-semibold text-primary uppercase font-mono">
                2. Transparent Trade-offs
              </div>
              <p className="text-xs text-foreground/75 leading-relaxed">
                Safely postpones low-priority project docs to tomorrow while strictly preserving imminent exam revisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open-Source AI Section */}
      <section className="py-16 border-t border-border bg-muted/10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">
            Open-Weight AI Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-foreground">
            Freedom from Proprietary LLM Lock-In
          </h2>
          <p className="text-sm text-foreground/80 max-w-2xl mx-auto leading-relaxed font-light">
            Native support for local Ollama endpoints (Qwen 2.5, Llama 3.2, Mistral, Gemma 2) with deterministic algorithmic fallbacks. Your academic notes and syllabus never leak to third-party clouds.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            {["Qwen 2.5:7b", "Llama 3.2", "Mistral 7B", "Gemma 2", "BGE Embeddings", "Deterministic Fallback"].map((m) => (
              <span
                key={m}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-xs font-mono font-medium shadow-sm text-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AcadFlow Full-Featured Footer */}
      <HeritageFooter />
    </div>
  );
}

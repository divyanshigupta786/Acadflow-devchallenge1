"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  UserCheck,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { StudentPreferences, LLMConfig } from "@/lib/types";

export default function SettingsPage() {
  const [pref, setPref] = useState<StudentPreferences>({
    preferred_study_duration: 45,
    break_duration: 15,
    preferred_study_time: "morning",
    available_daily_hours: 4.0,
    strong_subjects: ["OSI Model", "TCP/IP", "Relational Algebra"],
    weak_subjects: ["Subnetting", "Concurrency Semaphores"],
    programming_task_multiplier: 1.3,
    reading_task_multiplier: 1.0,
  });

  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: "ollama",
    model: "qwen2.5:7b",
    ollama_base_url: "http://localhost:11434",
    status: "ready",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([ApiClient.getPreferences(), ApiClient.getLLMConfig()])
      .then(([p, l]) => {
        if (p) setPref(p);
        if (l) setLlmConfig(l);
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await ApiClient.updatePreferences(pref);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save preferences failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-foreground">Loading configuration...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <SettingsIcon className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Preferences</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Tune your personal study rhythms, workload multipliers, and local open-source AI models.
        </p>
      </div>

      {/* Student Preferences Form */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-base text-foreground">Student Rhythms & Workload Learning</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Personalized Engine</span>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Focus Session Duration (Minutes)
              </label>
              <input
                type="number"
                min="20"
                max="120"
                step="5"
                value={pref.preferred_study_duration}
                onChange={(e) =>
                  setPref({ ...pref, preferred_study_duration: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Recharge Break Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="45"
                step="5"
                value={pref.break_duration}
                onChange={(e) => setPref({ ...pref, break_duration: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Available Daily Hours
              </label>
              <input
                type="number"
                min="1.0"
                max="12.0"
                step="0.5"
                value={pref.available_daily_hours}
                onChange={(e) =>
                  setPref({ ...pref, available_daily_hours: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Historical Programming Workload Multiplier
              </label>
              <input
                type="number"
                min="0.8"
                max="2.5"
                step="0.05"
                value={pref.programming_task_multiplier}
                onChange={(e) =>
                  setPref({ ...pref, programming_task_multiplier: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-sm"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Learned ratio: {pref.programming_task_multiplier}x based on completed implementation tasks.
              </span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Preferences saved and synced with planner!</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/25 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Open-Source AI Architecture Configuration (Section 6) */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-base text-foreground">Open-Source AI Engine Architecture</h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            {llmConfig.status}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                Inference Provider
              </span>
              <span className="font-bold text-foreground text-sm uppercase">
                {llmConfig.provider}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                Configured Model
              </span>
              <span className="font-bold text-foreground text-sm font-mono">
                {llmConfig.model}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                Endpoint URL
              </span>
              <span className="font-bold text-foreground text-sm font-mono truncate block">
                {llmConfig.ollama_base_url}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Zero-Hallucination & Privacy Guarantee</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              AcadFlow operates directly against open-weight models (Qwen, Llama, Mistral, Gemma). When Ollama is active, inference executes completely offline on your host without proprietary cloud leakage. When offline, deterministic fallback guarantees zero invented deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

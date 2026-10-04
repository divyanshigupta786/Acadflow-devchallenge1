"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox as InboxIcon,
  Sparkles,
  Mic,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { ExtractedTaskItem, InboxExtractResponse } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { VoiceInputModal } from "@/components/VoiceInputModal";

export default function AcademicInboxPage() {
  const router = useRouter();

  const [rawText, setRawText] = useState(
    "I have a DBMS assignment due Friday, CN quiz Wednesday on chapters 3 and 4, a project presentation tomorrow at 3 PM, and maths midterms next week. I can probably study for three hours today."
  );
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<InboxExtractResponse | null>(null);
  const [editableTasks, setEditableTasks] = useState<ExtractedTaskItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Voice Modal
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const sampleInputs = [
    "I have a DBMS assignment due Friday, CN quiz Wednesday on chapters 3 and 4, a project presentation tomorrow, and maths midterms next week.",
    "Prof announced Operating Systems Lab 4 due next Monday 11:59 PM. Must include test suite and report.",
    "Read chapter 3 of Computer Networks textbook on subnetting and CIDR before tomorrow's lecture.",
  ];

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setExtracting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await ApiClient.extractInbox(rawText, "text");
      setExtractResult(res);
      setEditableTasks(res.extracted_tasks);
    } catch (err: any) {
      setError(err.message || "Extraction failed. Check backend connection.");
    } finally {
      setExtracting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await ApiClient.uploadInboxScreenshot(formData);
      setExtractResult(res);
      setEditableTasks(res.extracted_tasks);
    } catch (err: any) {
      setError(err.message || "Screenshot OCR failed.");
    } finally {
      setExtracting(false);
    }
  };

  const handleTaskFieldChange = (index: number, field: keyof ExtractedTaskItem, value: any) => {
    const updated = [...editableTasks];
    updated[index] = { ...updated[index], [field]: value };
    setEditableTasks(updated);
  };

  const handleRemoveTask = (index: number) => {
    setEditableTasks(editableTasks.filter((_, i) => i !== index));
  };

  const handleConfirmAndSave = async () => {
    if (editableTasks.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await ApiClient.confirmInboxTasks(editableTasks);
      setSuccessMsg(`Successfully saved ${editableTasks.length} task(s) into your academic schedule!`);
      setTimeout(() => {
        router.push("/tasks");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save tasks.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <InboxIcon className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Inbox</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Throw messy messages, announcements, syllabus notes, or voice memos here. The open-source AI engine extracts structured tasks without hallucinating deadlines.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Unstructured Input</span>
          </label>
          <div className="flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              onClick={() => setShowVoiceModal(true)}
              className="px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground transition-all"
            >
              <Mic className="h-3.5 w-3.5 text-primary" />
              <span>Voice</span>
            </button>

            {/* Screenshot Upload */}
            <label className="px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground cursor-pointer transition-all">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
              <span>Screenshot / OCR</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste anything: WhatsApp chat, teacher announcement, quiz notes, exam schedule..."
          className="w-full h-32 p-4 rounded-xl bg-muted/30 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none leading-relaxed"
        />

        {/* Sample presets */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
            Quick demo test prompts (Click to fill):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleInputs.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRawText(sample)}
                className="text-xs px-2.5 py-1 rounded-lg border border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-left truncate max-w-md"
              >
                &ldquo;{sample.slice(0, 50)}...&rdquo;
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleExtract}
            disabled={extracting || !rawText.trim()}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 shadow-md shadow-primary/25 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Sparkles className={`h-4 w-4 ${extracting ? "animate-spin" : ""}`} />
            <span>{extracting ? "AI Engine Extracting..." : "Understand & Extract Tasks"}</span>
          </button>
        </div>
      </div>

      {/* Extracted Tasks Review Area */}
      {editableTasks.length > 0 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Extracted Academic Items ({editableTasks.length})</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                  {extractResult?.ai_provider}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Review and modify extracted attributes before committing to your database.
              </p>
            </div>

            <button
              onClick={handleConfirmAndSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Confirm & Save Tasks"}</span>
            </button>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editableTasks.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3 relative group"
              >
                {/* Delete task button */}
                <button
                  onClick={() => handleRemoveTask(idx)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition-all"
                  title="Remove from batch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Title & Subject */}
                <div className="space-y-2 pr-8">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Task Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleTaskFieldChange(idx, "title", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">Subject / Course</label>
                      <input
                        type="text"
                        value={item.subject_name || ""}
                        onChange={(e) => handleTaskFieldChange(idx, "subject_name", e.target.value)}
                        placeholder="e.g. DBMS"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">Task Type</label>
                      <select
                        value={item.task_type}
                        onChange={(e) => handleTaskFieldChange(idx, "task_type", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {["Assignment", "Exam", "Quiz", "Project", "Presentation", "Lab", "Reading", "Revision", "Other"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Deadlines & Estimated Effort */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Estimated Effort</span>
                    </label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={item.estimated_minutes}
                        onChange={(e) => handleTaskFieldChange(idx, "estimated_minutes", Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-muted/30 border border-border text-xs text-foreground"
                      />
                      <span className="text-xs text-muted-foreground">mins</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Extracted Deadline</span>
                    </label>
                    <div className="mt-1 text-xs">
                      {item.deadline ? (
                        <span className="font-semibold text-foreground">
                          {new Date(item.deadline).toLocaleDateString()} {new Date(item.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">None explicit</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Anti-hallucination / Inferred notice */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                  <UrgencyBadge priority={item.priority} size="sm" />
                  <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                    {item.is_workload_inferred ? "AI Estimate" : "User Confirmed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Modal */}
      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTranscriptReady={(transcript) => {
          setRawText(transcript);
          // Auto-trigger extract
          setTimeout(() => {
            ApiClient.extractInbox(transcript, "voice").then((res) => {
              setExtractResult(res);
              setEditableTasks(res.extracted_tasks);
            });
          }, 200);
        }}
      />
    </div>
  );
}

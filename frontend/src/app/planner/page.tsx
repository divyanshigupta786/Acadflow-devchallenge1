"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  Coffee,
  AlertCircle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { ScheduleResponse, ScheduleBlock } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { AdaptiveReplanModal } from "@/components/AdaptiveReplanModal";

export default function PlannerPage() {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "calendar">("daily");
  const [availableHours, setAvailableHours] = useState(3.5);
  const [generating, setGenerating] = useState(false);
  const [showReplanModal, setShowReplanModal] = useState(false);

  const fetchSchedule = async () => {
    try {
      const res = await ApiClient.getTodaySchedule();
      setSchedule(res);
      setAvailableHours(res.available_hours || 3.5);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleRegenerate = async (hours: number) => {
    setGenerating(true);
    setAvailableHours(hours);
    try {
      const res = await ApiClient.generateSchedule({
        available_hours: hours,
        start_time: "10:00",
        include_breaks: true,
      });
      setSchedule(res);
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleBlock = async (blockId: string) => {
    try {
      await ApiClient.toggleScheduleBlock(blockId);
      // Update local state
      if (schedule) {
        const updated = schedule.blocks.map((b) =>
          b.id === blockId ? { ...b, is_completed: !b.is_completed } : b
        );
        setSchedule({ ...schedule, blocks: updated });
      }
    } catch (err) {
      console.error("Toggle block error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Adaptive Planner</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dynamic study schedules generated from task deadlines, workloads, and real-time availability.
          </p>
        </div>

        {/* View Switcher & Replan CTA */}
        <div className="flex items-center gap-2">
          {/* Daily / Weekly / Calendar Tabs */}
          <div className="flex p-1 rounded-xl bg-muted/50 border border-border text-xs font-medium">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "daily" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "weekly" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "calendar" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={() => setShowReplanModal(true)}
            className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Adaptive Replan</span>
          </button>
        </div>
      </div>

      {/* Time Budget Selector Bar (Section 18) */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Today&apos;s Available Study Budget
          </span>
          <p className="text-xs text-muted-foreground">
            How many hours can you dedicate to study sessions today?
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[2.0, 3.0, 4.0, 5.0].map((hrs) => (
            <button
              key={hrs}
              onClick={() => handleRegenerate(hrs)}
              disabled={generating}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                availableHours === hrs
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {hrs} Hours
            </button>
          ))}
        </div>
      </div>

      {/* AI Explanation Banner */}
      {schedule?.ai_explanation && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3 text-xs leading-relaxed text-foreground">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary block mb-0.5">Academic Planning Strategy</span>
            {schedule.ai_explanation}
          </div>
        </div>
      )}

      {/* Schedule Blocks View */}
      {viewMode === "daily" ? (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-semibold text-muted-foreground">
            <span>SCHEDULED TIMELINE</span>
            <span>TOTAL: {schedule?.total_study_minutes || 0} MINS</span>
          </div>

          <div className="space-y-3">
            {schedule?.blocks && schedule.blocks.length > 0 ? (
              schedule.blocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    block.is_break
                      ? "bg-muted/20 border-dashed border-border"
                      : block.is_completed
                      ? "bg-emerald-500/5 border-emerald-500/30 opacity-75"
                      : "bg-card hover:border-primary/40 border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Completion Toggle */}
                    {!block.is_break ? (
                      <button
                        onClick={() => handleToggleBlock(block.id)}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                          block.is_completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {block.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ) : (
                      <Coffee className="h-4 w-4 text-muted-foreground ml-1" />
                    )}

                    {/* Time Window */}
                    <div className="text-xs font-mono font-bold text-muted-foreground min-w-[95px]">
                      {block.start_time} – {block.end_time}
                    </div>

                    {/* Block Info */}
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          block.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {block.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{block.subject_name}</span>
                        <span>•</span>
                        <span>{block.duration_minutes} mins</span>
                        {block.revised_reason && (
                          <span className="text-[10px] text-orange-500 font-mono">
                            ({block.revised_reason})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  {!block.is_break && (
                    <UrgencyBadge priority={block.priority} size="sm" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No blocks scheduled. Select your available hours above to generate today&apos;s plan.
              </div>
            )}
          </div>
        </div>
      ) : viewMode === "weekly" ? (
        /* Weekly View */
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground">Weekly Academic Load Distribution</h3>
          <div className="grid grid-cols-7 gap-2 pt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <div key={d} className="p-3 rounded-xl border border-border/80 bg-muted/20 text-center space-y-2">
                <span className="text-xs font-bold text-foreground block">{d}</span>
                <span className="text-[11px] font-mono text-muted-foreground block">
                  {i === 2 ? "3.5h (CN Quiz)" : i === 4 ? "4.0h (DBMS)" : "2.5h"}
                </span>
                <div className={`h-1.5 w-full rounded-full ${i === 2 || i === 4 ? "bg-red-500" : "bg-primary"}`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground">Monthly Academic Calendar</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono pt-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-muted-foreground font-bold pb-2">{d}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border text-xs ${
                  i === 6
                    ? "border-red-500 bg-red-500/10 text-red-500 font-bold"
                    : i === 8
                    ? "border-orange-500 bg-orange-500/10 text-orange-500 font-bold"
                    : "border-border/60 hover:bg-muted"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adaptive Replan Modal */}
      <AdaptiveReplanModal
        isOpen={showReplanModal}
        onClose={() => setShowReplanModal(false)}
        onPlanUpdated={(newPlan) => setSchedule(newPlan)}
      />
    </div>
  );
}

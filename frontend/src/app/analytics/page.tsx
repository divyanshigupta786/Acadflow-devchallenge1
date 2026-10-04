"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PieChart,
  Calendar,
  Layers,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { AnalyticsData } from "@/lib/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-foreground">Computing academic analytics...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-xs text-red-500">Failed to load analytics.</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Analytics</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Real completion metrics, historical workload accuracy, and AI pattern detection.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Completion Rate</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{data.completion_rate_percentage}%</span>
            <span className="text-xs text-emerald-500 font-semibold font-mono">
              {data.total_tasks_completed} done
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{data.total_tasks_pending} tasks still pending</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Study Hours Logged</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{data.total_study_hours}h</span>
            <span className="text-xs text-primary font-semibold">Active focus</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Across 5 enrolled courses</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Overdue Tasks</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{data.total_tasks_overdue}</span>
            <span className={`text-xs font-semibold ${data.total_tasks_overdue > 0 ? "text-red-500" : "text-emerald-500"}`}>
              {data.total_tasks_overdue > 0 ? "Action required" : "Zero friction"}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Impacting semester GPA</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Peak Focus Window</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground truncate">{data.most_productive_time_window}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Learned from session focus ratings</span>
        </div>
      </div>

      {/* Weekly Workload Chart & Estimation Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Workload Distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="font-bold text-base text-foreground">Weekly Workload (Est vs Actual)</h2>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded bg-primary" /> Est Hours
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded bg-emerald-500" /> Actual Hours
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-4">
            {data.weekly_workload.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  {/* Estimated Bar */}
                  <div
                    className="w-full max-w-[18px] bg-primary/40 rounded-t-md transition-all hover:bg-primary"
                    style={{ height: `${Math.min(100, (day.estimated_hours / 6.0) * 100)}%` }}
                    title={`Estimated: ${day.estimated_hours}h`}
                  />
                  {/* Actual Bar */}
                  <div
                    className="w-full max-w-[18px] bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-400"
                    style={{ height: `${Math.min(100, (day.actual_hours / 6.0) * 100)}%` }}
                    title={`Actual: ${day.actual_hours}h`}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Estimation Accuracy (Section 17 & 28) */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="font-bold text-base text-foreground">Personal Workload Learning</h2>
            <p className="text-xs text-muted-foreground">
              Compares planned vs actual task duration to adjust future schedule blocks.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {data.estimation_accuracy.map((acc, i) => (
              <div key={i} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{acc.category}</span>
                  <span className="font-mono text-primary font-bold">
                    Ratio: {acc.ratio}x ({acc.ratio > 1 ? `+${Math.round((acc.ratio - 1) * 100)}% longer` : "on target"})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Planned: {Math.round(acc.estimated_avg_mins)}m avg</span>
                  <span>Actual: {Math.round(acc.actual_avg_mins)}m avg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${
                      acc.ratio > 1.2 ? "bg-orange-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, acc.ratio * 50)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grounded AI Insights from Real Data */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Grounded AI Pattern Insights (No Hallucinations)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.ai_insights.map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-xl bg-muted/30 border border-border/80 flex flex-col justify-between space-y-2 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{ins.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-primary/10 text-primary">
                    {ins.type}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {ins.description}
                </p>
              </div>

              <div className="text-[10px] text-primary/90 font-mono pt-2 border-t border-border/60">
                Grounding: {ins.evidence}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <h2 className="font-bold text-base text-foreground">Course Workload & Progress Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subject_distribution.map((sub, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span
                  className="font-bold font-mono px-2 py-0.5 rounded text-[11px]"
                  style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                >
                  {sub.course_code}
                </span>
                <span className="text-muted-foreground">{sub.total_hours_spent}h spent</span>
              </div>
              <div className="font-bold text-foreground truncate">{sub.course_name}</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-foreground">{sub.progress_percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${sub.progress_percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <span>{sub.completed_tasks} completed</span>
                <span>{sub.pending_tasks} pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Inbox,
  RefreshCw,
  Plus,
  BookOpen,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Task, ScheduleResponse, AnalyticsData } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { AdaptiveReplanModal } from "@/components/AdaptiveReplanModal";
import { QuickAddTaskModal } from "@/components/QuickAddTaskModal";
import { formatTimeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showReplanModal, setShowReplanModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    try {
      const [tList, sToday, aData] = await Promise.all([
        ApiClient.getTasks(),
        ApiClient.getTodaySchedule(),
        ApiClient.getAnalytics(),
      ]);
      setTasks(tList);
      setSchedule(sToday);
      setAnalytics(aData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const criticalTasks = tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "completed");
  const highPriorityTasks = tasks.filter((t) => t.priority === "HIGH" && t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed" || t.progress >= 100);

  // Find next closest deadline
  const upcomingWithDeadlines = tasks
    .filter((t) => t.deadline && t.status !== "completed")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  const nextDeadlineTask = upcomingWithDeadlines[0];

  const academicLoad =
    criticalTasks.length >= 2 || highPriorityTasks.length >= 4 ? "HEAVY" : "MODERATE";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Good Morning, Alex 👋
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                academicLoad === "HEAVY"
                  ? "bg-red-500/10 text-red-500 border border-red-500/30"
                  : "bg-primary/10 text-primary border border-primary/30"
              }`}
            >
              Academic Load: {academicLoad}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Here is your real-time decision dashboard and active workload plan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReplanModal(true)}
            className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-all text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span>Adaptive Replan</span>
          </button>
          <Link
            href="/inbox"
            className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>Academic Inbox</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Tasks Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Critical Tasks</span>
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{criticalTasks.length}</span>
            <span className="text-xs text-red-500 font-semibold uppercase">Needs Immediate Focus</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {criticalTasks[0]?.title || "No critical tasks pending"}
          </p>
        </div>

        {/* High Priority Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>High Priority</span>
            <span className="h-2 w-2 rounded-full bg-orange-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{highPriorityTasks.length}</span>
            <span className="text-xs text-orange-500 font-semibold uppercase">Due within 48h</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {highPriorityTasks[0]?.title || "No high priority tasks"}
          </p>
        </div>

        {/* Next Deadline Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Next Deadline</span>
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          {nextDeadlineTask ? (
            <div className="mt-3">
              <span className="text-xl font-bold text-foreground truncate block">
                {nextDeadlineTask.title}
              </span>
              <span className="text-xs font-semibold text-primary">
                Due {formatTimeAgo(nextDeadlineTask.deadline!)}
              </span>
            </div>
          ) : (
            <div className="mt-3 text-xs text-muted-foreground">All deadlines completed!</div>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            Course: {nextDeadlineTask?.course_name || "General"}
          </p>
        </div>

        {/* Total Completed Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Completed Work</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{completedTasks.length}</span>
            <span className="text-xs text-emerald-500 font-semibold">
              {analytics?.completion_rate_percentage || 0}% Completion
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {analytics?.total_study_hours || 0} total study hours logged
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Active Plan & Tasks (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Adaptive Plan Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-base text-foreground">Today&apos;s Focus Schedule</h2>
              </div>
              <Link
                href="/planner"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* AI Explanation Banner */}
            {schedule?.ai_explanation && (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">{schedule.ai_explanation}</p>
              </div>
            )}

            {/* Schedule Blocks */}
            <div className="space-y-2.5 pt-1">
              {schedule?.blocks && schedule.blocks.length > 0 ? (
                schedule.blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      block.is_break
                        ? "bg-muted/30 border-dashed border-border text-muted-foreground"
                        : "bg-card hover:border-primary/40 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono font-bold text-muted-foreground min-w-[90px]">
                        {block.start_time} – {block.end_time}
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-foreground">
                          {block.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {block.subject_name} • {block.duration_minutes} mins
                        </div>
                      </div>
                    </div>

                    {!block.is_break && (
                      <UrgencyBadge priority={block.priority} size="sm" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No active blocks generated yet. Use the Planner to build a schedule.
                </div>
              )}
            </div>
          </div>

          {/* Active Tasks Progress Bars (Section 13 layout) */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-bold text-base text-foreground">Urgent Active Tasks</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-4">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[280px]">
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge priority={task.priority} size="sm" />
                      <span className="font-mono text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        task.priority === "CRITICAL"
                          ? "bg-red-500"
                          : task.priority === "HIGH"
                          ? "bg-orange-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Course: {task.course_name || "General"}</span>
                    <span>{task.remaining_minutes}m remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Next Actions (1 Col) */}
        <div className="space-y-6">
          {/* Grounded AI Insights Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Grounded AI Workload Insights</span>
            </div>

            {analytics?.ai_insights && analytics.ai_insights.length > 0 ? (
              <div className="space-y-3">
                {analytics.ai_insights.slice(0, 2).map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1 text-xs"
                  >
                    <div className="font-bold text-foreground">{ins.title}</div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {ins.description}
                    </p>
                    <div className="text-[10px] text-primary/80 font-mono pt-1">
                      Evidence: {ins.evidence}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/30 text-xs text-muted-foreground text-center">
                AI insights will generate dynamically as you complete and track tasks.
              </div>
            )}
          </div>

          {/* Quick Academic Actions */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-4">
            <h3 className="font-bold text-sm text-foreground">Quick Action Center</h3>
            <p className="text-xs text-muted-foreground">
              Dump messy course notes or announcements straight into the intelligence layer.
            </p>

            <div className="space-y-2">
              <Link
                href="/inbox"
                className="w-full p-2.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center justify-between shadow-sm hover:bg-primary/90 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  Paste Academic Info
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setShowReplanModal(true)}
                className="w-full p-2.5 rounded-xl border border-border bg-card text-xs font-semibold flex items-center justify-between hover:bg-muted text-foreground transition-all"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-orange-500" />
                  &ldquo;I lost time today&rdquo; (Replan)
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <Link
                href="/knowledge"
                className="w-full p-2.5 rounded-xl border border-border bg-card text-xs font-semibold flex items-center justify-between hover:bg-muted text-foreground transition-all"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Ask Syllabus RAG
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Replan Modal */}
      <AdaptiveReplanModal
        isOpen={showReplanModal}
        onClose={() => setShowReplanModal(false)}
        onPlanUpdated={(newPlan) => setSchedule(newPlan)}
      />

      {/* Add Task Modal */}
      <QuickAddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskCreated={(newTask) => setTasks([newTask, ...tasks])}
      />
    </div>
  );
}

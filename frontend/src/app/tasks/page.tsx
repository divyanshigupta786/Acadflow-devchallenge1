"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Sliders,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Task, Course } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { QuickAddTaskModal } from "@/components/QuickAddTaskModal";
import { formatTimeAgo } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Add Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Progress Update Dialog
  const [activeTaskForProgress, setActiveTaskForProgress] = useState<Task | null>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [minutesSpent, setMinutesSpent] = useState(30);

  const fetchTasks = async () => {
    try {
      const [tList, cList] = await Promise.all([
        ApiClient.getTasks(),
        ApiClient.getCourses(),
      ]);
      setTasks(tList);
      setCourses(cList);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateProgress = async () => {
    if (!activeTaskForProgress) return;
    try {
      const updated = await ApiClient.updateTaskProgress(activeTaskForProgress.id, {
        progress: newProgress,
        minutes_spent: minutesSpent,
      });
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      setActiveTaskForProgress(null);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await ApiClient.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (courseFilter !== "all" && t.course_id !== courseFilter) return false;
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(t.course_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Tasks</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic prioritization, workload learning, and progress tracking.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, chapter, or course..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs font-medium focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="CRITICAL">Critical (Red)</option>
            <option value="HIGH">High (Orange)</option>
            <option value="MEDIUM">Medium (Yellow)</option>
            <option value="LOW">Low (Green)</option>
          </select>

          {/* Course */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs font-medium focus:outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Task Details */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <UrgencyBadge priority={task.priority} score={task.priority_score} size="sm" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                    {task.course_name || "General"}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {task.task_type}
                  </span>
                  {task.is_inferred && (
                    <span className="text-[10px] text-muted-foreground italic">AI Estimate</span>
                  )}
                </div>

                <div className="font-bold text-sm sm:text-base text-foreground">
                  {task.title}
                </div>

                {task.priority_explanation && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {task.priority_explanation}
                  </p>
                )}

                {/* Progress bar */}
                <div className="w-full max-w-md space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Progress: {task.progress}%</span>
                    <span>
                      {task.remaining_minutes}m remaining ({task.actual_minutes}m spent)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        task.status === "completed"
                          ? "bg-emerald-500"
                          : task.priority === "CRITICAL"
                          ? "bg-red-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Deadline & Actions */}
              <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                <div className="text-xs md:text-right space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">
                    Deadline
                  </span>
                  {task.deadline ? (
                    <span className="font-semibold text-foreground flex items-center gap-1 md:justify-end">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>{formatTimeAgo(task.deadline)}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">None explicit</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTaskForProgress(task);
                      setNewProgress(task.progress);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-all"
                  >
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    <span>Log Progress</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-xs text-muted-foreground p-8 rounded-2xl border border-dashed border-border">
            No tasks found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Progress Update Dialog */}
      {activeTaskForProgress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-foreground">
              Update Progress: {activeTaskForProgress.title}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Completion Percentage: {newProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Minutes Dedicated in this session
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={minutesSpent}
                  onChange={(e) => setMinutesSpent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveTaskForProgress(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateProgress}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <QuickAddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskCreated={(newTask) => setTasks([newTask, ...tasks])}
      />
    </div>
  );
}

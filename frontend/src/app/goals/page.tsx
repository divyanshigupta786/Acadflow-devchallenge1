"use client";

import React, { useState, useEffect } from "react";
import { Target, Plus, CheckCircle2, Circle, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Goal } from "@/lib/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");

  const fetchGoals = async () => {
    try {
      const res = await ApiClient.getGoals();
      setGoals(res);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleToggleMilestone = async (goal: Goal, milestoneId: number) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    try {
      const res = await ApiClient.updateGoal(goal.id, { milestones: updatedMilestones });
      setGoals(goals.map((g) => (g.id === res.id ? res : g)));
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newGoal = await ApiClient.createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      });
      setGoals([newGoal, ...goals]);
      setShowAddGoal(false);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic & Career Goals</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Break long-term aspirations into actionable weekly milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddGoal(true)}
          className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                  {goal.category}
                </span>
                <span className="text-xs font-bold text-foreground font-mono">{goal.progress}% Complete</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-foreground">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{goal.description}</p>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              {/* Milestones checklist */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Action Milestones
                </span>
                <div className="space-y-1.5">
                  {goal.milestones.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleMilestone(goal, m.id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/50 flex items-center gap-2.5 text-xs text-foreground transition-all group"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary" />
                      )}
                      <span className={m.completed ? "line-through text-muted-foreground" : "text-foreground"}>
                        {m.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-foreground">Create Long-Term Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Operating Systems & Linux Kernel"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm"
                >
                  <option value="Academic">Academic</option>
                  <option value="Career">Career</option>
                  <option value="Skill">Technical Skill</option>
                  <option value="Exam">Competitive Exam</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target outcome and rationale..."
                  className="w-full h-20 p-3 rounded-xl bg-muted/40 border border-border text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90"
                >
                  Create Goal & Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

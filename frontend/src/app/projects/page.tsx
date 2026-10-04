"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getProjects()
      .then((res) => setProjects(res))
      .catch((err) => console.error("Error loading projects:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Mode</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collaborative academic projects, team roles, dependency tracking, and AI blocker detection.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5"
          >
            {/* Project Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">{proj.title}</h3>
                  {proj.active_blockers_count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{proj.active_blockers_count} Blocker Detected</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{proj.description}</p>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-muted-foreground uppercase font-semibold">
                Status: {proj.status}
              </span>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Team Roster ({proj.members.length})</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {proj.members.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-muted/30 border border-border/80 text-xs">
                    <div className="font-bold text-foreground">{m.name}</div>
                    <div className="text-[11px] text-primary">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Tasks & Blockers (Section 29) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Deliverables & Dependencies
              </span>

              <div className="space-y-2">
                {proj.project_tasks.map((pt) => (
                  <div
                    key={pt.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      pt.is_blocked
                        ? "bg-red-500/5 border-red-500/30"
                        : "bg-muted/20 border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {pt.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : pt.is_blocked ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-bold text-foreground text-sm">{pt.title}</span>
                      </div>

                      {pt.is_blocked && pt.blocker_reason && (
                        <div className="text-red-500 text-[11px] font-medium flex items-center gap-1 pl-6">
                          <span>AI Blocker Warning: {pt.blocker_reason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pl-6 sm:pl-0">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Assignee: <span className="text-foreground">{pt.assignee_name || "Unassigned"}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                          pt.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : pt.is_blocked
                            ? "bg-red-500/10 text-red-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {pt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

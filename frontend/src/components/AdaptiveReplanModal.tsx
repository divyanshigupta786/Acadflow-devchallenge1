"use client";

import React, { useState } from "react";
import { RefreshCw, X, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { ScheduleResponse } from "@/lib/types";

interface AdaptiveReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated?: (newPlan: ScheduleResponse) => void;
}

export const AdaptiveReplanModal: React.FC<AdaptiveReplanModalProps> = ({
  isOpen,
  onClose,
  onPlanUpdated,
}) => {
  const [reason, setReason] = useState("I only completed 45 minutes of DBMS.");
  const [hoursLost, setHoursLost] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    "I only completed 45 minutes of DBMS.",
    "I lost 2 hours today due to unexpected lab session.",
    "I ran out of energy and need to stop for today.",
    "Unexpected quiz announced for tomorrow morning.",
  ];

  const handleReplan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.adaptivelyReplan({
        reason,
        hours_lost: hoursLost,
      });
      setResult(res);
      if (onPlanUpdated) {
        onPlanUpdated(res);
      }
    } catch (err: any) {
      setError(err.message || "Failed to trigger adaptive replanning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Adaptive Replanning</h3>
              <p className="text-xs text-muted-foreground">
                Recalculate priorities and adapt today&apos;s schedule dynamically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
                  What changed in your academic schedule?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., I only completed 45 minutes of DBMS, or I lost 2 hours today..."
                  className="w-full h-24 p-3 rounded-xl bg-muted/40 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Quick preset badges */}
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                  Or select a common academic situation:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReason(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all text-left ${
                        reason === preset
                          ? "bg-primary/10 border-primary text-primary font-medium"
                          : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {preset}
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
            </>
          ) : (
            /* Result View: Adaptive Plan Explanation */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Adaptive Decision Engine Output</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {result.ai_explanation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="font-semibold text-emerald-600 block mb-1">
                    ✓ Preserved (High Stakes)
                  </span>
                  <ul className="space-y-1 text-muted-foreground">
                    {result.preserved_tasks.length > 0 ? (
                      result.preserved_tasks.map((t, idx) => (
                        <li key={idx} className="truncate">• {t}</li>
                      ))
                    ) : (
                      <li>No conflicting high-priority tasks</li>
                    )}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <span className="font-semibold text-orange-600 block mb-1">
                    ↳ Shifted to Tomorrow
                  </span>
                  <ul className="space-y-1 text-muted-foreground">
                    {result.moved_tasks.length > 0 ? (
                      result.moved_tasks.map((t, idx) => (
                        <li key={idx} className="truncate">• {t}</li>
                      ))
                    ) : (
                      <li>Schedule compacted without deferrals</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          {!result ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReplan}
                disabled={loading || !reason.trim()}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Recalculating..." : "Run Adaptive Replan"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm shadow-primary/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Done & Apply to Planner</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { UrgencyLevel } from "@/lib/types";

interface UrgencyBadgeProps {
  priority: UrgencyLevel | string;
  score?: number;
  className?: string;
  size?: "sm" | "md";
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ priority, score, className = "", size = "md" }) => {
  const p = (priority || "MEDIUM").toUpperCase();

  let badgeColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
  let label = "Medium";
  let dotColor = "bg-yellow-500";

  if (p === "CRITICAL") {
    badgeColor = "bg-red-500/10 text-red-500 border-red-500/30";
    label = "Critical";
    dotColor = "bg-red-500";
  } else if (p === "HIGH") {
    badgeColor = "bg-orange-500/10 text-orange-500 border-orange-500/30";
    label = "High";
    dotColor = "bg-orange-500";
  } else if (p === "LOW") {
    badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    label = "Low";
    dotColor = "bg-emerald-500";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${badgeColor} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{label}</span>
      {score !== undefined && <span className="opacity-70 font-mono text-[10px]">({Math.round(score)})</span>}
    </span>
  );
};

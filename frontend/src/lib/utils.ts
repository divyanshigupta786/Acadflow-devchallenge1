import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimeAgo(dateString: string): string {
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) {
    const absH = Math.abs(diffHours);
    if (absH > 24) return `${Math.floor(absH / 24)}d ago`;
    return `${absH}h ago (overdue)`;
  }
  if (diffHours <= 24) return `in ${diffHours} hours`;
  const days = Math.round(diffHours / 24);
  return `in ${days} days`;
}

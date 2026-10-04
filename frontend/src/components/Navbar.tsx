"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { NotificationItem } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  onOpenQuickTask?: () => void;
  onOpenReplan?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickTask, onOpenReplan }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [userEmail, setUserEmail] = useState("Alex Chen");

  useEffect(() => {
    // Only load if logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("acadflow_token") : null;
    if (token) {
      ApiClient.getNotifications()
        .then((res) => setNotifications(res))
        .catch(() => {});
      ApiClient.getMe()
        .then((u) => setUserEmail(u.full_name || u.email))
        .catch(() => {});
    }
  }, []);

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    ApiClient.clearToken();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks, notes, courses, syllabus..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Replan CTA */}
        {onOpenReplan && (
          <button
            onClick={onOpenReplan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title="Signature Adaptive Replanning"
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span>Adaptive Replan</span>
          </button>
        )}

        {/* Quick Add Task */}
        {onOpenQuickTask ? (
          <button
            onClick={onOpenQuickTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
        ) : (
          <Link
            href="/inbox"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Academic Inbox</span>
          </Link>
        )}

        {/* Smart Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            aria-label="Smart Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Context-Aware Notifications
                </span>
                <span className="text-muted-foreground font-mono">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No active notifications. You are on track!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-xs transition-all ${
                        n.urgency === "critical"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        <span className="truncate">{n.title}</span>
                        {n.urgency === "critical" && (
                          <span className="text-[10px] text-red-500 font-mono uppercase font-bold">Urgent</span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {userEmail[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-medium text-foreground hidden sm:inline-block max-w-[120px] truncate">
            {userEmail}
          </span>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

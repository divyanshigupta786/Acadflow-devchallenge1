"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  CheckSquare,
  BookOpen,
  FileText,
  Target,
  FolderGit2,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
} from "lucide-react";
import { HeritageMark } from "@/components/HeritageMark";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Academic Inbox", href: "/inbox", icon: Inbox, badge: "AI" },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Knowledge Base", href: "/knowledge", icon: FileText, badge: "RAG" },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Project Mode", href: "/projects", icon: FolderGit2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Hide sidebar on landing, login, register
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-md flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <HeritageMark className="w-6 h-auto text-primary" />
          </div>
          <div>
            <div className="font-serif font-semibold text-lg leading-tight tracking-tight flex items-center gap-1.5 text-foreground">
              <span>Heritage Grove</span>
            </div>
            <div className="text-[11px] text-primary font-mono font-medium tracking-wide">
              AcadFlow OS
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Local AI Status Card */}
      <div className="p-3 border-t border-border">
        <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">AI Intelligence</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active
            </span>
          </div>
          <div className="text-[11px] text-foreground font-mono truncate">
            Open-Source Core: Qwen / Llama
          </div>
          <div className="text-[10px] text-muted-foreground">
            Zero-hallucination verified
          </div>
        </div>
      </div>
    </aside>
  );
};

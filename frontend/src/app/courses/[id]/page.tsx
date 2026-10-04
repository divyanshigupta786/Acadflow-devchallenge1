"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Course, Task } from "@/lib/types";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { formatTimeAgo } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    Promise.all([
      ApiClient.getCourse(courseId),
      ApiClient.getCourseTasks(courseId),
    ])
      .then(([c, tList]) => {
        setCourse(c);
        setTasks(tList);
      })
      .catch((err) => console.error("Error loading course detail:", err))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted-foreground">Loading course intelligence...</div>;
  }

  if (!course) {
    return <div className="p-12 text-center text-xs text-red-500">Course not found.</div>;
  }

  // Find upcoming exam/quiz for this course
  const upcomingExam = tasks.find(
    (t) => (t.task_type === "Exam" || t.task_type === "Quiz") && t.status !== "completed"
  );

  const weakTopic = course.weak_areas?.[0] || "Foundational concepts";

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Back button & Header */}
      <div className="space-y-3">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Courses</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="text-xs font-mono font-bold px-2.5 py-1 rounded-md"
                style={{ backgroundColor: `${course.color}20`, color: course.color }}
              >
                {course.code}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.name}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Instructor: {course.instructor || "Faculty"} • {course.credits} Credits • Semester {course.semester}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/inbox"
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all"
            >
              Import Notes / Syllabus
            </Link>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner (Section 21) */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Targeted AI Recommendation</span>
        </div>
        <p className="text-sm font-medium text-foreground leading-relaxed">
          &ldquo;Spend your next 45-minute session on {weakTopic} because it is currently a weak topic and is relevant to your upcoming {upcomingExam?.title || "assessments"}.&rdquo;
        </p>
      </div>

      {/* Progress & Strong / Weak Areas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Progress Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Syllabus Mastery
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-foreground">{course.progress}%</span>
            <span className="text-xs text-emerald-500 font-semibold">On Track</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${course.progress}%`, backgroundColor: course.color }}
            />
          </div>
        </div>

        {/* Strong Areas Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Strong Areas</span>
          </span>
          <ul className="space-y-1.5 text-xs text-foreground pt-1">
            {course.strong_areas && course.strong_areas.length > 0 ? (
              course.strong_areas.map((sa, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{sa}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">General concepts mastered</li>
            )}
          </ul>
        </div>

        {/* Needs Revision Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Needs Revision</span>
          </span>
          <ul className="space-y-1.5 text-xs text-foreground pt-1">
            {course.weak_areas && course.weak_areas.length > 0 ? (
              course.weak_areas.map((wa, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span>{wa}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No critical weak points identified</li>
            )}
          </ul>
        </div>
      </div>

      {/* Course Tasks Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-base text-foreground">Course Tasks & Deadlines</h3>
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl border border-border flex items-center justify-between hover:border-primary/40 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UrgencyBadge priority={task.priority} size="sm" />
                    <span className="text-sm font-semibold text-foreground">{task.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{task.task_type}</span>
                    <span>•</span>
                    <span>{task.progress}% complete</span>
                    <span>•</span>
                    <span>{task.remaining_minutes}m remaining</span>
                  </div>
                </div>

                <div className="text-xs text-right">
                  {task.deadline ? (
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>{formatTimeAgo(task.deadline)}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">No deadline</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No tasks associated with this course yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

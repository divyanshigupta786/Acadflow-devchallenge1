"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Plus, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Course } from "@/lib/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getCourses()
      .then((res) => setCourses(res))
      .catch((err) => console.error("Failed to load courses:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Courses</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Subject health, syllabus mastery, weak topic tracking, and AI study recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: `${course.color}20`, color: course.color }}
                >
                  {course.code}
                </span>
                <span className="text-xs text-muted-foreground">{course.credits} Credits</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{course.instructor || "Faculty"}</p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Syllabus Mastery</span>
                  <span className="font-mono font-semibold text-foreground">{course.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                  />
                </div>
              </div>

              {/* Weak / Revision topics badge */}
              {course.weak_areas && course.weak_areas.length > 0 && (
                <div className="text-[11px] pt-1">
                  <span className="text-muted-foreground">Needs Revision: </span>
                  <span className="text-orange-500 font-medium">
                    {course.weak_areas.slice(0, 2).join(", ")}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-primary font-semibold">
              <span>View Course Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

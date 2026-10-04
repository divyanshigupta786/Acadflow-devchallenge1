"use client";

import React from "react";
import { HeritageMark } from "./HeritageMark";

export const HeritageFooter: React.FC = () => {
  return (
    <footer className="site-footer relative isolate flex flex-col min-h-[70vh] sm:min-h-[85vh] overflow-hidden overflow-wrap-break-word bg-background text-foreground pt-12 pb-8 px-6 sm:px-12 border-t border-border mt-16 transition-colors duration-300">
      {/* Background Media with Looping Ink Landscape */}
      <div className="footer-media absolute inset-0 -z-10 pointer-events-none opacity-85 dark:opacity-40 transition-opacity duration-300" aria-hidden="true">
        <video
          className="footer-bg animate-fade-in absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none filter dark:invert dark:hue-rotate-180 dark:contrast-125 dark:brightness-90 transition-all duration-500"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="footer-inner relative w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between">
        {/* Main Grid */}
        <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 items-start pt-6">
          {/* Brand Column */}
          <div className="brand lg:col-span-2 space-y-4">
            <div className="brand-lockup animate-rise-in flex items-center gap-3" style={{ animationDelay: "0.04s" }}>
              <HeritageMark className="brand-mark w-10 h-auto text-primary" />
              <div>
                <span className="brand-name font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground block leading-tight">
                  AcadFlow
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
                  AI Academic Operating System
                </span>
              </div>
            </div>
            <p className="brand-blurb animate-rise-in text-sm font-light text-foreground/80 max-w-sm leading-relaxed" style={{ animationDelay: "0.12s" }}>
              Turning academic chaos into crystalline clarity. Built for university &amp; college students with deterministic priority modeling, adaptive replanning, and local AI privacy.
            </p>
            <ul className="contact-list space-y-2 text-xs pt-2">
              <li className="animate-rise-in flex items-center gap-2.5" style={{ animationDelay: "0.20s" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary shrink-0" aria-hidden="true">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <a href="mailto:support@acadflow.dev" className="hover:underline underline-offset-4 transition-all">support@acadflow.dev</a>
              </li>
              <li className="animate-rise-in flex items-center gap-2.5" style={{ animationDelay: "0.28s" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary shrink-0" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <a href="https://github.com/divyanshigupta786/Acadflow-devchallenge1" target="_blank" rel="noreferrer" className="hover:underline underline-offset-4 transition-all">GitHub Repository</a>
              </li>
              <li className="animate-rise-in flex items-center gap-2.5" style={{ animationDelay: "0.36s" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary shrink-0" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>Open-Source • Student-First OS</span>
              </li>
            </ul>
          </div>

          {/* Nav Column 1: Platform */}
          <nav className="col space-y-3" aria-label="Platform">
            <h3 className="col-title animate-rise-in font-serif text-base font-semibold tracking-wider uppercase text-primary" style={{ animationDelay: "0.16s" }}>
              Platform
            </h3>
            <ul className="link-list space-y-2 text-sm text-foreground/80">
              {[
                { label: "Daily Planner", href: "/dashboard" },
                { label: "Academic Inbox", href: "/inbox" },
                { label: "Priority Matrix", href: "/tasks" },
                { label: "Knowledge Base (RAG)", href: "/knowledge" },
                { label: "Course Portals", href: "/courses" },
                { label: "Workload Analytics", href: "/analytics" },
              ].map((item, idx) => (
                <li key={item.label} className="animate-rise-in" style={{ animationDelay: `${0.16 + 0.08 * (idx + 1)}s` }}>
                  <a href={item.href} className="inline-block hover-slide transition-all">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Nav Column 2: Intelligence */}
          <nav className="col space-y-3" aria-label="Intelligence">
            <h3 className="col-title animate-rise-in font-serif text-base font-semibold tracking-wider uppercase text-primary" style={{ animationDelay: "0.24s" }}>
              Intelligence
            </h3>
            <ul className="link-list space-y-2 text-sm text-foreground/80">
              {[
                { label: "Adaptive Replanning", href: "/planner" },
                { label: "Zero Hallucination Math", href: "/tasks" },
                { label: "Local LLMs (Ollama)", href: "/ai" },
                { label: "Syllabus & PDF Parser", href: "/inbox" },
                { label: "Target GPA Simulator", href: "/analytics" },
                { label: "Focus Study Blocks", href: "/dashboard" },
              ].map((item, idx) => (
                <li key={item.label} className="animate-rise-in" style={{ animationDelay: `${0.24 + 0.08 * (idx + 1)}s` }}>
                  <a href={item.href} className="inline-block hover-slide transition-all">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Nav Column 3: Academic Dispatch */}
          <div className="newsletter space-y-3">
            <h3 className="col-title animate-rise-in font-serif text-base font-semibold tracking-wider uppercase text-primary" style={{ animationDelay: "0.40s" }}>
              Academic Dispatch
            </h3>
            <p className="animate-rise-in text-xs text-foreground/80 leading-relaxed" style={{ animationDelay: "0.48s" }}>
              Sign up for weekly student productivity insights, algorithm updates, and exam planning strategies.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="subscribe animate-rise-in flex items-center max-w-xs border border-primary bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden" style={{ animationDelay: "0.56s" }}>
              <label htmlFor="footer-nl-email" className="sr-only">Email address</label>
              <input
                id="footer-nl-email"
                type="email"
                name="email"
                placeholder="student@university.edu"
                autoComplete="email"
                required
                className="w-full px-3 py-2 text-xs bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="px-3.5 py-2 bg-primary text-cream hover:bg-primary/90 transition-colors flex items-center justify-center shrink-0 active:scale-95"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom border-t border-border/80 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/75">
          <div className="animate-rise-in flex items-center gap-2" style={{ animationDelay: "0.60s" }}>
            <span className="font-semibold text-foreground">AcadFlow OS</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved. Built for students.</span>
          </div>

          {/* Socials with staggered animation */}
          <div className="socials flex items-center gap-4">
            {[
              {
                label: "GitHub",
                href: "https://github.com/divyanshigupta786/Acadflow-devchallenge1",
                path: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
                delay: "0.64s",
              },
              {
                label: "Twitter",
                href: "https://twitter.com",
                path: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z",
                delay: "0.70s",
              },
              {
                label: "LinkedIn",
                href: "https://linkedin.com",
                path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z",
                delay: "0.76s",
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="animate-rise-in hover-lift hover:text-primary transition-all"
                style={{ animationDelay: s.delay }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>

          {/* Legal */}
          <nav className="legal flex items-center gap-6" aria-label="Legal">
            {[
              { label: "Student Privacy", href: "#", delay: "0.70s" },
              { label: "Academic Terms", href: "#", delay: "0.78s" },
              { label: "Local AI Security", href: "#", delay: "0.86s" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="animate-rise-in hover:underline underline-offset-4 transition-all"
                style={{ animationDelay: item.delay }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

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
                  Heritage Grove
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
                  Academic Operating System
                </span>
              </div>
            </div>
            <p className="brand-blurb animate-rise-in text-sm font-light text-foreground/80 max-w-sm leading-relaxed" style={{ animationDelay: "0.12s" }}>
              Crafting digital experiences that connect, delight, and leave a lasting imprint. Transforming fragmented academic chaos into structured clarity.
            </p>
            <ul className="contact-list space-y-2 text-xs pt-2">
              <li className="animate-rise-in flex items-center gap-2.5" style={{ animationDelay: "0.20s" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary shrink-0" aria-hidden="true">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <a href="mailto:care@heritage.com" className="hover:underline underline-offset-4 transition-all">care@heritage.com</a>
              </li>
              <li className="animate-rise-in flex items-center gap-2.5" style={{ animationDelay: "0.28s" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary shrink-0" aria-hidden="true">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <a href="tel:+910000000000" className="hover:underline underline-offset-4 transition-all">+91 00000 00000</a>
              </li>
              <li className="animate-rise-in flex items-center gap-2.5" style={{ animationDelay: "0.36s" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-primary shrink-0" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>India</span>
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
                { label: "Task Prioritization", href: "/tasks" },
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

          {/* Nav Column 2: Heritage */}
          <nav className="col space-y-3" aria-label="Heritage">
            <h3 className="col-title animate-rise-in font-serif text-base font-semibold tracking-wider uppercase text-primary" style={{ animationDelay: "0.24s" }}>
              Heritage
            </h3>
            <ul className="link-list space-y-2 text-sm text-foreground/80">
              {[
                { label: "Our Roots", href: "#" },
                { label: "Our Craftwork", href: "#" },
                { label: "Adaptive Algorithms", href: "#" },
                { label: "Open-Source LLMs", href: "#" },
                { label: "Media Enquiry", href: "#" },
              ].map((item, idx) => (
                <li key={item.label} className="animate-rise-in" style={{ animationDelay: `${0.24 + 0.08 * (idx + 1)}s` }}>
                  <a href={item.href} className="inline-block hover-slide transition-all">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Nav Column 3: The Letter */}
          <div className="newsletter space-y-3">
            <h3 className="col-title animate-rise-in font-serif text-base font-semibold tracking-wider uppercase text-primary" style={{ animationDelay: "0.40s" }}>
              The Letter
            </h3>
            <p className="animate-rise-in text-xs text-foreground/80 leading-relaxed" style={{ animationDelay: "0.48s" }}>
              Sign up for early notice on new features, stories &amp; academic productivity insights.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="subscribe animate-rise-in flex items-center max-w-xs border border-primary bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden" style={{ animationDelay: "0.56s" }}>
              <label htmlFor="footer-nl-email" className="sr-only">Email address</label>
              <input
                id="footer-nl-email"
                type="email"
                name="email"
                placeholder="Leave your email"
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
          {/* Socials with staggered animation */}
          <div className="socials flex items-center gap-4">
            {[
              {
                label: "Facebook",
                path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z",
                delay: "0.64s",
              },
              {
                label: "Twitter",
                path: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z",
                delay: "0.70s",
              },
              {
                label: "Instagram",
                path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                delay: "0.76s",
              },
              {
                label: "LinkedIn",
                path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z",
                delay: "0.82s",
              },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="animate-rise-in hover-lift hover:text-primary transition-all"
                style={{ animationDelay: s.delay }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>

          {/* Legal */}
          <nav className="legal flex items-center gap-6" aria-label="Legal">
            {[
              { label: "Privacy Notice", delay: "0.70s" },
              { label: "Terms & Policies", delay: "0.78s" },
              { label: "Cookie Notice", delay: "0.86s" },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
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

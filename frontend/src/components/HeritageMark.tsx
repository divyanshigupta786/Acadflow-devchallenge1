import React from "react";

export const HeritageMark: React.FC<{ className?: string; width?: number | string; height?: number | string }> = ({
  className = "w-7 h-auto",
  width,
  height,
}) => {
  return (
    <svg
      className={`brand-mark shrink-0 ${className}`}
      viewBox="0 0 96 120"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <ellipse cx="48" cy="60" rx="45" ry="57" />
      <path d="M48 88V46" strokeLinecap="round" />
      <path d="M48 58c-8-2-14-8-16-16 9 0 15 5 16 16Zm0 0c8-2 14-8 16-16-9 0-15 5-16 16Z" />
      <path d="M48 74c-9-2-15-8-17-17 10 0 16 6 17 17Zm0 0c9-2 15-8 17-17-10 0-16 6-17 17Z" />
      <path d="M48 46c-6-3-9-9-8-16 6 3 9 9 8 16Zm0 0c6-3 9-9 8-16-6 3-9 9-8 16Z" />
      <path d="M30 44c-5 1-9-1-12-5 5-2 9-1 12 5Zm36 0c5 1 9-1 12-5-5-2-9-1-12 5Z" />
    </svg>
  );
};

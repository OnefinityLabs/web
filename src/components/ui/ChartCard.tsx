"use client";

import { type ReactNode, useState } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  expandable?: boolean;
  /** Extra content shown only in expanded view */
  expandedContent?: ReactNode;
}

export function ChartCard({
  title,
  children,
  expandable = true,
  expandedContent,
}: ChartCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Normal card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--card-shadow)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold tracking-wide text-text2">
            {title}
          </h3>
          {expandable && (
            <button
              onClick={() => setExpanded(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text3 transition-colors hover:border-border2 hover:text-text1"
              title="Expand chart"
              aria-label={`Expand ${title}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          )}
        </div>
        <div className="chart-wrap">{children}</div>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative mx-6 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-surface p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text1">{title}</h2>
              <button
                onClick={() => setExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text2 transition-colors hover:border-border2 hover:text-text1"
                aria-label="Close expanded view"
              >
                ✕
              </button>
            </div>
            <div className="h-[400px]">{children}</div>
            {expandedContent && (
              <div className="mt-6 border-t border-border pt-6">
                {expandedContent}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Skeleton placeholder for chart cards during loading */
export function ChartCardSkeleton({ height = "h-60" }: { height?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="skeleton mb-4 h-4 w-40" />
      <div className={`skeleton ${height} w-full`} />
    </div>
  );
}

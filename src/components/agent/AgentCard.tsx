"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SparklineSVG } from "@/components/ui/SparklineSVG";
import type { AgentSummary } from "@/lib/types";

interface AgentCardProps {
  agent: AgentSummary;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isProcessing = agent.status === "processing";
  const isReady = agent.status === "ready";

  // Processing card - non-clickable
  if (isProcessing && agent.processingInfo) {
    const { totalRecords, processedSoFar, etaMinutes, source, batchLabel } = agent.processingInfo;
    const progress = Math.round((processedSoFar / totalRecords) * 100);
    const hours = Math.floor(etaMinutes / 60);
    const minutes = etaMinutes % 60;
    const etaDisplay = hours > 0 ? `~${hours}h ${minutes}m` : `~${minutes}m`;

    return (
      <div
        className="relative overflow-hidden rounded-[14px] border border-border bg-card p-6 shadow-[var(--card-shadow)]"
        style={{ "--accent": agent.accent } as React.CSSProperties}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ background: agent.accent }}
        />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-base font-bold text-text1">{agent.name}</div>
            <div className="mt-1 text-xs text-text3">{agent.sector}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={agent.type === "Outbound" ? "outbound" : "inbound"}>
              {agent.type}
            </Badge>
            <Badge variant="processing">
              <span className="inline-block animate-spin">⟳</span> Processing
            </Badge>
          </div>
        </div>

        {/* ETA */}
        <div className="mb-2 text-[13px] font-bold text-amber">
          {etaDisplay} remaining
        </div>

        {/* Progress Bar */}
        <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: agent.accent }}
          />
        </div>

        {/* Progress Counts */}
        <div className="mb-2 flex justify-between text-[10px] text-text3">
          <span>{processedSoFar.toLocaleString()} processed</span>
          <span>{totalRecords.toLocaleString()} total</span>
        </div>

        {/* Source Info */}
        <div className="text-[10px] text-text3">
          Source: {source} {batchLabel && `· ${batchLabel}`}
        </div>
      </div>
    );
  }

  // Normal/Ready card - clickable
  return (
    <Link href={`/agent/${agent.id}`}>
      <div
        className="group relative cursor-pointer overflow-hidden rounded-[14px] border border-border bg-card p-6 shadow-[var(--card-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        style={
          {
            "--accent": agent.accent,
            borderColor: undefined,
          } as React.CSSProperties
        }
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = agent.accent)
        }
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ background: agent.accent }}
        />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-base font-bold text-text1">{agent.name}</div>
            <div className="mt-1 text-xs text-text3">{agent.sector}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={agent.type === "Outbound" ? "outbound" : "inbound"}>
              {agent.type}
            </Badge>
            {agent.hasBatches && agent.batches ? (
              <Badge variant="batches">{agent.batches.length} Batches</Badge>
            ) : isReady ? (
              <Badge variant="ready">Ready</Badge>
            ) : (
              <Badge variant="live" dotBefore>
                Live
              </Badge>
            )}
          </div>
        </div>

        {/* North Star KPI */}
        <div className="mb-4">
          <div
            className="text-[44px] font-extrabold leading-none tracking-tight"
            style={{ color: agent.accent }}
          >
            {agent.northStar.value}
          </div>
          <div className="mt-1 text-xs font-medium text-text2">
            {agent.northStar.label}
          </div>
          <div
            className={`mt-1 text-xs font-medium ${agent.northStar.positive ? "text-green" : "text-red"}`}
          >
            {agent.northStar.positive ? "↑" : "↓"} {agent.northStar.delta}
          </div>
        </div>

        <div className="mb-4 h-px bg-border" />

        {/* Secondary KPIs */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {agent.secondaryKpis.map((kpi) => (
            <div key={kpi.label}>
              <div className="text-lg font-bold text-text1">{kpi.value}</div>
              <div className="mt-0.5 text-[11px] text-text3">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div className="mb-4">
          <SparklineSVG data={agent.sparkData} color={agent.accent} />
        </div>

        {/* CTA */}
        <button
          className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: agent.accent }}
        >
          View Intelligence →
        </button>
      </div>
    </Link>
  );
}

/** Skeleton card during loading */
export function AgentCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-border bg-card p-6 shadow-[var(--card-shadow)]">
      <div className="mb-5 flex justify-between">
        <div>
          <div className="skeleton h-5 w-40" />
          <div className="skeleton mt-2 h-3 w-28" />
        </div>
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
      </div>
      <div className="skeleton mb-2 h-12 w-24" />
      <div className="skeleton mb-1 h-3 w-32" />
      <div className="skeleton mb-4 h-3 w-36" />
      <div className="mb-4 h-px bg-border" />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <div className="skeleton h-5 w-16" />
          <div className="skeleton mt-1 h-3 w-24" />
        </div>
        <div>
          <div className="skeleton h-5 w-16" />
          <div className="skeleton mt-1 h-3 w-24" />
        </div>
      </div>
      <div className="skeleton mb-4 h-12 w-full" />
      <div className="skeleton h-10 w-full rounded-lg" />
    </div>
  );
}

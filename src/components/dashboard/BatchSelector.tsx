"use client";

import { useState } from "react";
import type { BatchInfo } from "@/lib/types";

interface BatchSelectorProps {
  batches: BatchInfo[];
  accent?: string;
  onBatchChange?: (batchId: number | null) => void;
}

function formatBatchLabel(batch: BatchInfo, index: number, total: number): string {
  if (batch.label) return batch.label;
  return `Batch ${total - index}`;
}

function formatDateRange(batch: BatchInfo): string {
  if (batch.date_from && batch.date_to) {
    const from = new Date(batch.date_from).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const to = new Date(batch.date_to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${from} – ${to}`;
  }
  return new Date(batch.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_CONFIG: Record<string, { color: string; label: string; pulse?: boolean }> = {
  ready:     { color: "#10B981", label: "Ready" },
  analyzing: { color: "#F59E0B", label: "Analyzing...", pulse: true },
  pending:   { color: "#3B82F6", label: "Pending" },
  ingesting: { color: "#8B5CF6", label: "Ingesting...", pulse: true },
  failed:    { color: "#EF4444", label: "Failed" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
      style={{ background: `${config.color}18`, color: config.color }}
    >
      <span
        className={`inline-block h-[6px] w-[6px] rounded-full ${config.pulse ? "animate-pulse" : ""}`}
        style={{ background: config.color }}
      />
      {config.label}
    </span>
  );
}

export function BatchSelector({
  batches,
  accent = "#06B6D4",
  onBatchChange,
}: BatchSelectorProps) {
  const [activeBatchId, setActiveBatchId] = useState<string>("all");

  const handleChange = (value: string) => {
    setActiveBatchId(value);
    onBatchChange?.(value === "all" ? null : parseInt(value));
  };

  const visibleBatches = batches.filter((b) => b.status !== "failed");

  if (visibleBatches.length === 0) return null;

  const totalCalls = visibleBatches.reduce((sum, b) => sum + (b.call_count || 0), 0);
  const selectedBatch = activeBatchId === "all"
    ? null
    : visibleBatches.find((b) => String(b.id) === activeBatchId);

  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-[var(--card-shadow)]">
      <label
        className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest"
        style={{ color: accent }}
      >
        Viewing Batch
      </label>

      <div className="relative">
        <select
          value={activeBatchId}
          onChange={(e) => handleChange(e.target.value)}
          className="min-w-[280px] max-w-[400px] appearance-none rounded-lg border border-border2 bg-surface px-3 py-2 pr-8 text-[13px] font-medium text-text1 outline-none transition-colors hover:border-blue focus:border-blue"
        >
          {visibleBatches.length > 1 && (
            <option value="all">
              All Batches — Combined ({totalCalls.toLocaleString()} calls)
            </option>
          )}
          {visibleBatches.map((batch, i) => (
            <option key={batch.id} value={String(batch.id)}>
              {formatBatchLabel(batch, i, visibleBatches.length)} ({batch.call_count.toLocaleString()} calls)
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text3">
          ▼
        </span>
      </div>

      {/* Date range for selected batch */}
      {selectedBatch && (
        <span className="text-[11px] italic text-text3">
          {formatDateRange(selectedBatch)}
        </span>
      )}

      {/* Status badge — always visible for the selected batch */}
      {selectedBatch && <StatusBadge status={selectedBatch.status} />}
    </div>
  );
}

export function BatchSelectorSkeleton() {
  return (
    <div className="mb-5 flex animate-pulse items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="h-3 w-24 rounded bg-border" />
      <div className="h-8 w-[280px] rounded-lg bg-surface" />
      <div className="h-3 w-48 rounded bg-border" />
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import type { RecentCall, CallFilters, KpiItem } from "@/lib/types";
import { fetchAgentCalls } from "@/lib/api";
import { CallDetailPanel } from "@/components/dashboard/CallDetailPanel";

/* ── Sentiment color ─────────────────────────────── */
const SENT_CLS: Record<string, string> = {
  pos: "text-green",
  neg: "text-red",
  neu: "text-text3",
};
const SENT_LABEL: Record<string, string> = {
  pos: "😊 Positive",
  neg: "😟 Negative",
  neu: "😐 Neutral",
};

/* ── Outcome badge styles ────────────────────────── */
const OC_STYLE: Record<string, { bg: string; text: string }> = {
  blue:  { bg: "rgba(37,99,235,.18)",    text: "#60A5FA" },
  green: { bg: "rgba(16,185,129,.18)",   text: "#34D399" },
  red:   { bg: "rgba(239,68,68,.18)",    text: "#FCA5A5" },
  amber: { bg: "rgba(245,158,11,.18)",   text: "#FCD34D" },
  grey:  { bg: "rgba(107,114,128,.18)",  text: "#9CA3AF" },
};

/* ── KPI label → filter key map ─────────────────── */
const KPI_TO_FILTER: Record<string, keyof CallFilters> = {
  "FCR Rate":          "fcr",
  "Issues Resolved":   "fcr",
  "Repeat Contacts":   "repeat",
  "Conversion Rate":   "conversion",
  "Leads Qualified":   "conversion",
  "Callback Rate":     "callback",
};

interface FilterableConversationsTableProps {
  agentId:      string;
  tenantId?:    string;
  initialCalls: RecentCall[];
  kpis:         KpiItem[];
  accent:       string;
  isOutbound:   boolean;
  batchId?:     number | null;
  /** When provided, filter state is controlled by the parent (KPI cards) */
  externalFilters?:         CallFilters;
  onExternalFiltersChange?: (f: CallFilters) => void;
}

export function FilterableConversationsTable({
  agentId,
  tenantId,
  initialCalls,
  kpis,
  accent,
  isOutbound: _isOutbound,
  batchId,
  externalFilters,
  onExternalFiltersChange,
}: FilterableConversationsTableProps) {
  /* ── State ───────────────────────────────────────── */
  const [calls, setCalls]                     = useState<RecentCall[]>(initialCalls);
  const [page, setPage]                       = useState(1);
  const [hasMore, setHasMore]                 = useState(initialCalls.length === 15);
  const [isLoadingMore, setIsMoreLoading]     = useState(false);
  const [isFiltering, setIsFiltering]         = useState(false);
  const [selectedCall, setSelectedCall]       = useState<RecentCall | null>(null);

  // Internal filter state (used when parent does not provide externalFilters)
  const [internalFilters, setInternalFilters] = useState<CallFilters>({});

  // Use external filters when parent provides them; else use internal
  const filters    = externalFilters    ?? internalFilters;
  const setFilters = onExternalFiltersChange ?? setInternalFilters;

  /* ── Re-fetch when external filters or batchId change ── */
  useEffect(() => {
    if (externalFilters === undefined) return;
    const run = async () => {
      setIsFiltering(true);
      const res = await fetchAgentCalls(agentId, 1, 15, externalFilters, tenantId, batchId);
      if (res.success && res.data) {
        setCalls(res.data);
        setPage(1);
        setHasMore(res.data.length === 15);
      }
      setIsFiltering(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilters, batchId]);

  /* ── Helper: fetch calls from page 1 with given filters ── */
  const fetchFiltered = useCallback(async (newFilters: CallFilters) => {
    setIsFiltering(true);
    const res = await fetchAgentCalls(agentId, 1, 15, newFilters, tenantId, batchId);
    if (res.success && res.data) {
      setCalls(res.data);
      setPage(1);
      setHasMore(res.data.length === 15);
    }
    setIsFiltering(false);
  }, [agentId, batchId]);

  /* ── Toggle a single filter key (internal mode only) ── */
  const toggleFilter = useCallback(async (key: keyof CallFilters) => {
    const newFilters: CallFilters = { ...filters };
    if (newFilters[key]) delete newFilters[key];
    else newFilters[key] = true;
    setFilters(newFilters);
    if (externalFilters === undefined) {
      await fetchFiltered(newFilters);
    }
  }, [filters, setFilters, externalFilters, fetchFiltered]);

  /* ── Clear all filters ─────────────────────────── */
  const clearFilters = useCallback(async () => {
    setFilters({});
    if (externalFilters === undefined) {
      await fetchFiltered({});
    }
  }, [setFilters, externalFilters, fetchFiltered]);

  /* ── Load more (respects active filters + batch) ── */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsMoreLoading(true);
    const nextPage = page + 1;
    const res = await fetchAgentCalls(agentId, nextPage, 15, filters, tenantId, batchId);
    if (res.success && res.data) {
      setCalls(prev => [...prev, ...res.data!]);
      setPage(nextPage);
      setHasMore(res.data.length === 15);
    }
    setIsMoreLoading(false);
  }, [agentId, page, filters, hasMore, isLoadingMore, batchId]);

  const activeFilterCount = Object.keys(filters).length;

  /* ── Only show KPI filter hint for filterable KPIs ── */
  const filterableKpis = kpis.filter(k => KPI_TO_FILTER[k.label]);

  return (
    <>
      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {Object.keys(filters).map(key => {
            const kpiLabel =
              Object.entries(KPI_TO_FILTER).find(([, v]) => v === key)?.[0] ?? key;
            return (
              <div
                key={key}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px]"
                style={{ borderColor: `${accent}55`, background: `${accent}15`, color: accent }}
              >
                <span>⊟</span>
                <span>
                  Filter: <strong className="text-text1">{kpiLabel}</strong>
                </span>
                <button
                  className="ml-1 text-text3 transition-colors hover:text-red"
                  onClick={() => toggleFilter(key as keyof CallFilters)}
                  aria-label={`Remove ${kpiLabel} filter`}
                >
                  ✕
                </button>
              </div>
            );
          })}
          <button
            className="text-[11px] text-text3 underline transition-colors hover:text-red"
            onClick={clearFilters}
          >
            Clear all
          </button>
          <span className="text-[11px] text-text3">
            {isFiltering
              ? "Filtering…"
              : `${calls.length} result${calls.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--card-shadow)]">
        {isFiltering ? (
          <div className="flex items-center justify-center py-14 text-[13px] text-text3">
            <span className="mr-2 inline-block animate-spin">⟳</span> Filtering…
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <div className="text-2xl">⊡</div>
            <div className="text-[13px] font-medium text-text2">
              No calls match this filter
            </div>
            <button
              className="mt-1 text-[12px] text-blue-l underline"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["Call ID", "Time", "Duration", "Outcome", "Sentiment", "Topic / Intent", ""].map(
                  h => (
                    <th
                      key={h}
                      className="px-3.5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-text3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {calls.map((call: RecentCall, i: number) => {
                const oc      = OC_STYLE[call.outcomeCls] ?? OC_STYLE.grey;
                const sentCls = SENT_CLS[call.sentCls]    ?? SENT_CLS.neu;
                const sentLbl = SENT_LABEL[call.sentCls]  ?? "—";
                return (
                  <tr
                    key={`${call.id}-${i}`}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-blue/[0.04]"
                    onClick={() => setSelectedCall(call)}
                  >
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-text3">
                      {call.id}
                    </td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text2">{call.time}</td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text2">{call.duration}</td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: oc.bg, color: oc.text }}
                      >
                        {call.outcome}
                      </span>
                    </td>
                    <td className={`px-3.5 py-2.5 text-[12px] ${sentCls}`}>{sentLbl}</td>
                    <td className="max-w-[280px] px-3.5 py-2.5 text-[11px] text-text2">
                      {call.topic || call.intent || "—"}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <button
                        className="rounded-md border border-border px-2.5 py-1 text-[11px] text-text3 transition-colors hover:border-border2 hover:text-text1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCall(call);
                        }}
                      >
                        See more
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Show More */}
        {hasMore && !isFiltering && calls.length > 0 && (
          <div className="border-t border-border px-4 py-3 text-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2 text-[12px] font-medium text-text2 transition-colors hover:border-border2 hover:text-text1 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <span className="inline-block animate-spin">⟳</span> Loading…
                </>
              ) : (
                <>Show More Conversations</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* KPI filter quick-access hint (below table, only when no filters active) */}
      {filterableKpis.length > 0 && activeFilterCount === 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text3">Filter by KPI:</span>
          {filterableKpis.map(kpi => {
            const fk = KPI_TO_FILTER[kpi.label]!;
            return (
              <button
                key={fk}
                onClick={() => toggleFilter(fk)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text3 transition-all hover:border-border2 hover:text-text1"
              >
                {kpi.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Call Detail Side Panel */}
      <CallDetailPanel
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
        accent={accent}
      />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   FilterableKpiCard — KPI card with click-to-filter support
   ════════════════════════════════════════════════════════════════ */

interface FilterableKpiCardProps {
  label:         string;
  value:         string;
  sub?:          string;
  highlight?:    boolean;
  special?:      boolean;
  accent:        string;
  activeFilters: CallFilters;
  onToggle:      (key: keyof CallFilters) => void;
}

export function FilterableKpiCard({
  label,
  value,
  sub,
  highlight,
  special,
  accent,
  activeFilters,
  onToggle,
}: FilterableKpiCardProps) {
  const filterKey = KPI_TO_FILTER[label];
  const isActive  = filterKey ? !!activeFilters[filterKey] : false;

  return (
    <div
      className={[
        "group relative rounded-xl border px-4 py-4 shadow-[var(--card-shadow)] transition-all duration-200",
        highlight ? "border-[var(--kpi-accent)] bg-card2" : "border-border bg-card",
        special   ? "border-green/40 bg-gradient-to-br from-green/[0.06] to-card" : "",
        filterKey ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]" : "",
      ].join(" ")}
      style={{
        "--kpi-accent": accent,
        ...(isActive
          ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}33` }
          : {}),
      } as React.CSSProperties}
      onClick={filterKey ? () => onToggle(filterKey) : undefined}
      title={
        filterKey
          ? isActive
            ? `Remove ${label} filter`
            : `Click to filter table by ${label}`
          : undefined
      }
    >
      {/* Active filter checkmark */}
      {isActive && (
        <div
          className="absolute right-2 top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ background: accent }}
        >
          ✓
        </div>
      )}

      {/* Value */}
      <div
        className={[
          "text-[26px] font-extrabold tracking-tight",
          special ? "text-green" : highlight ? "" : "text-text1",
        ].join(" ")}
        style={highlight ? { color: accent } : undefined}
      >
        {value}
      </div>

      <div className="mt-1 text-[11px] font-medium text-text2">{label}</div>
      {sub && (
        <div className={`mt-0.5 text-[10px] ${special ? "text-green/70" : "text-text3"}`}>
          {sub}
        </div>
      )}

      {/* Filter affordance hint */}
      {filterKey && (
        <div
          className={[
            "mt-2 text-[9px] font-semibold uppercase tracking-wider transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
          ].join(" ")}
          style={{ color: accent }}
        >
          {isActive ? "Filtering ✓ · Click to remove" : "Click to filter →"}
        </div>
      )}
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashNav } from "@/components/layout/DashNav";
import { KpiCard, KpiCardSkeleton } from "@/components/ui/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/ui/ChartCard";
import { DataTable, DataTableSkeleton } from "@/components/ui/DataTable";
import { FcrQueryChart } from "@/components/charts/FcrQueryChart";
import { VolumeQueryChart } from "@/components/charts/VolumeQueryChart";
import { RepeatTrendChart } from "@/components/charts/RepeatTrendChart";
import { EscalationChart } from "@/components/charts/EscalationChart";
import { fetchAgentDetail } from "@/lib/api";
import type {
  KpiItem,
  ChartDataset,
  DoughnutDataset,
  RecentCall,
  AgentDetail,
} from "@/lib/types";

const TABLE_COLUMNS = [
  "Call ID",
  "Time",
  "Duration",
  "Outcome",
  "Sentiment",
  "Key Topic",
];

/**
 * Agent Dashboard Page
 *
 * Shows KPI strip, 4 charts, and recent conversations table.
 * Fetches real data from backend API.
 */
export default function AgentDashboardPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const [agentData, setAgentData] = useState<AgentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgentData() {
      setIsLoading(true);
      setError(null);

      const response = await fetchAgentDetail(agentId);

      if (response.success && response.data) {
        setAgentData(response.data);
      } else {
        setError(response.error?.message || "Failed to load agent data");
      }

      setIsLoading(false);
    }

    loadAgentData();
  }, [agentId]);

  const agentName = agentData?.name || "Loading...";
  const agentType = agentData?.type || "Inbound";
  const agentSector = agentData?.sector || "Loading...";
  const agentAccent = agentData?.accent || "#7C3AED";

  const kpis: KpiItem[] = agentData?.kpis || [];
  const primaryChart: ChartDataset | null = agentData?.chartData.primary || null;
  const secondaryChart: DoughnutDataset | null = agentData?.chartData.secondary || null;
  const tertiaryChart: ChartDataset | null = agentData?.chartData.tertiary || null;
  const quaternaryChart: DoughnutDataset | null = agentData?.chartData.quaternary || null;
  const recentCalls: RecentCall[] = agentData?.recentCalls || [];
  const analysedPct = agentData?.analysedPct || 0;

  // Chart config titles matching the HTML
  const chartTitles = {
    primary: "FCR Rate by Query Type",
    secondary: "Call Volume by Query Type",
    tertiary: "Repeat Contact Trend (30 Days)",
    quaternary: "Escalation Reasons",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashNav
        name={agentName}
        type={agentType}
        sector={agentSector}
        analysedPct={analysedPct}
      />

      <main className="flex-1 overflow-y-auto p-7">
        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red/30 bg-red/10 p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red">
                  Failed to load dashboard data
                </p>
                <p className="mt-0.5 text-xs text-text2">{error}</p>
              </div>
              <button className="ml-auto rounded-lg border border-red/30 px-3 py-1 text-xs font-medium text-red transition-colors hover:bg-red/10">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── KPI Strip ───────────────────────────────────────── */}
        <section className="mb-6 grid grid-cols-5 gap-3.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : kpis.length > 0 ? (
            kpis.map((kpi) => (
              <KpiCard
                key={kpi.label}
                value={kpi.value}
                label={kpi.label}
                sub={kpi.sub}
                highlight={kpi.highlight}
                special={kpi.special}
                accent={agentAccent}
              />
            ))
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <KpiEmptyCard key={i} index={i} />
            ))
          )}
        </section>

        {/* ── Charts Row 1 (3fr : 2fr) ────────────────────────── */}
        <section className="mb-4 grid grid-cols-[3fr_2fr] gap-4">
          {isLoading ? (
            <>
              <ChartCardSkeleton height="h-60" />
              <ChartCardSkeleton height="h-60" />
            </>
          ) : (
            <>
              <ChartCard
                title={chartTitles.primary}
                expandedContent={
                  <p className="text-xs text-text3">
                    Detailed FCR breakdown per query type will be shown here
                    with resolution counts, trend analysis, and individual call
                    references.
                  </p>
                }
              >
                <FcrQueryChart data={primaryChart} accent={agentAccent} />
              </ChartCard>
              <ChartCard
                title={chartTitles.secondary}
                expandedContent={
                  <p className="text-xs text-text3">
                    Expanded view with daily distribution and volume comparison
                    across query types.
                  </p>
                }
              >
                <VolumeQueryChart data={secondaryChart} />
              </ChartCard>
            </>
          )}
        </section>

        {/* ── Charts Row 2 (1fr : 1fr) ────────────────────────── */}
        <section className="mb-6 grid grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <ChartCardSkeleton height="h-52" />
              <ChartCardSkeleton height="h-52" />
            </>
          ) : (
            <>
              <ChartCard
                title={chartTitles.tertiary}
                expandedContent={
                  <p className="text-xs text-text3">
                    Full 30-day trend with spike annotations and top repeat
                    callers list.
                  </p>
                }
              >
                <RepeatTrendChart data={tertiaryChart} accent={agentAccent} />
              </ChartCard>
              <ChartCard
                title={chartTitles.quaternary}
                expandedContent={
                  <p className="text-xs text-text3">
                    Escalation reason detail cards and most recent escalated
                    calls.
                  </p>
                }
              >
                <EscalationChart data={quaternaryChart} />
              </ChartCard>
            </>
          )}
        </section>

        {/* ── Recent Conversations ────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text3">
            Recent Conversations
            <span className="h-px flex-1 bg-border" />
          </div>
          {isLoading ? (
            <DataTableSkeleton />
          ) : (
            <DataTable columns={TABLE_COLUMNS} data={recentCalls} />
          )}
        </section>

        {/* ── Analysis In Progress Banner ─────────────────────── */}
        {/* {!isLoading && !error && kpis.length === 0 && (
          <div className="mt-8 flex items-center justify-center rounded-xl border border-border bg-card p-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border2 bg-surface">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-blue-l"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-text1">
                Dashboard ready for data
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-text3">
                This dashboard is fully built and waiting for the backend API
                connection. Once connected, KPI cards, charts, and conversation
                data will populate automatically.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs text-text3">
                <span className="inline-block h-2 w-2 rounded-full bg-amber" />
                Agent ID: <code className="text-text2">{agentId}</code>
              </div>
            </div>
          </div>
        )} */}
      </main>
    </div>
  );
}

/** Empty KPI placeholder cards */
function KpiEmptyCard({ index }: { index: number }) {
  const placeholders = [
    { label: "Total Inbound Calls", sub: "Last 30 days" },
    { label: "FCR Rate", sub: "Industry avg: 72%", highlight: true },
    { label: "Repeat Contacts", sub: "% of all calls" },
    { label: "Avg Handle Time", sub: "Per resolved call" },
    { label: "Conversations Analysed", sub: "Pending analysis", special: true },
  ];

  const p = placeholders[index] ?? placeholders[0];

  return (
    <div
      className={`rounded-xl border p-5 ${p.highlight ? "border-blue/30 bg-card2" : p.special ? "border-green/20 bg-gradient-to-br from-green/4 to-card" : "border-border bg-card"}`}
    >
      <div className="text-[28px] font-extrabold tracking-tight text-text3/40">
        —
      </div>
      <div className="mt-1 text-xs font-medium text-text2">{p.label}</div>
      <div className="mt-1 text-[11px] text-text3">{p.sub}</div>
    </div>
  );
}

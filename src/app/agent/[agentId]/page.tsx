"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { DashNav } from "@/components/layout/DashNav";
import { KpiCardSkeleton } from "@/components/ui/KpiCard";
// Chart imports — re-enable when charts are restored
// import { ChartCard, ChartCardSkeleton } from "@/components/ui/ChartCard";
import { DataTableSkeleton } from "@/components/ui/DataTable";
// import { FcrQueryChart } from "@/components/charts/FcrQueryChart";
// import { VolumeQueryChart } from "@/components/charts/VolumeQueryChart";
// import { RepeatTrendChart } from "@/components/charts/RepeatTrendChart";
// import { EscalationChart } from "@/components/charts/EscalationChart";
import { InsightsGrid } from "@/components/dashboard/InsightsGrid";
import { BatchSelector, BatchSelectorSkeleton } from "@/components/dashboard/BatchSelector";
import { BatchImportModal } from "@/components/dashboard/BatchImportModal";

import {
  FilterableConversationsTable,
  FilterableKpiCard,
} from "@/components/dashboard/FilterableConversationsTable";
import {
  fetchAgentDetail,
  fetchProjectDetail,
  findProjectByKey,
  fetchProjectBatches,
  fetchProjectAnalytics,
  fetchAgentCalls,
} from "@/lib/api";
import type {
  CallFilters,
  KpiItem,
  // ChartDataset,     // re-enable with charts
  // DoughnutDataset,  // re-enable with charts
  RecentCall,
  AgentDetail,
  BatchInfo,
} from "@/lib/types";


/**
 * Agent Dashboard Page
 *
 * KPI cards are filterable — clicking FCR Rate or Repeat Contacts
 * applies a live filter to the Recent Conversations table (AND logic,
 * multi-select). Each row has a "See more" button that opens a
 * slide-in side panel with full call intelligence.
 */
export default function AgentDashboardPage() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const agentId     = params.agentId as string;
  const tenantId    = searchParams.get("tenant") ?? "finserve-lending";

  const [agentData, setAgentData] = useState<AgentDetail | null>(null);
  const [originalAgentData, setOriginalAgentData] = useState<AgentDetail | null>(null);
  const [originalCalls, setOriginalCalls] = useState<RecentCall[]>([]);
  const [isLoading, setIsLoading]  = useState(true);
  const [error, setError]          = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Project + batch state (from new batch system)
  const [projectId, setProjectId]             = useState<number | null>(null);
  const [projectTenantKey, setProjectTenantKey] = useState<string | null>(null);
  const [batches, setBatches]                 = useState<BatchInfo[]>([]);
  const [batchesLoading, setBatchesLoading]   = useState(true);
  const [activeBatchId, setActiveBatchId]     = useState<number | null>(null);

  // KPI filter state lifted here so KPI cards and table stay in sync
  const [activeFilters, setActiveFilters] = useState<CallFilters>({});

  // Keyed list of initial calls (reset on filter change via FilterableConversationsTable)
  const [initialCalls, setInitialCalls] = useState<RecentCall[]>([]);

  // Project display overrides (set when agentId is a numeric project ID)
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectSector, setProjectSector] = useState<string | null>(null);
  // The resolved agent key for use in batch change / calls fetching
  const [effectiveAgentKey, setEffectiveAgentKey] = useState<string>(agentId);

  const isNumericId = /^\d+$/.test(agentId);

  // Fetch project info + agent dashboard data + batches in one effect
  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      setBatchesLoading(true);
      setError(null);

      let agentKey = agentId;
      let tenantKey = tenantId;
      let projName: string | null = null;
      let projSector: string | null = null;
      let projId: number | null = null;

      // If agentId is numeric, it's a project ID — resolve the real keys first
      if (isNumericId) {
        const projRes = await fetchProjectDetail(parseInt(agentId));
        if (projRes.success && projRes.data) {
          const proj = projRes.data;
          agentKey = proj.project_key || agentId;
          tenantKey = proj.tenant_config_key || tenantId;
          projName = proj.name;
          projSector = proj.project_types?.name || null;
          projId = proj.id;
          setEffectiveAgentKey(agentKey);
          setProjectName(projName);
          setProjectSector(projSector);
          setProjectId(proj.id);
          setProjectTenantKey(proj.tenant_config_key);
          setBatches(proj.cdr_batch || []);
        } else {
          setError("Project not found");
          setIsLoading(false);
          setBatchesLoading(false);
          return;
        }
      } else {
        // Legacy slug-based agentId — look up project by key
        setEffectiveAgentKey(agentId);
        const projectRes = await findProjectByKey(agentId);
        if (projectRes.success && projectRes.data) {
          setProjectId(projectRes.data.id);
          setProjectTenantKey(projectRes.data.tenant_config_key);
          setBatches(projectRes.data.cdr_batch || []);
        }
      }

      setBatchesLoading(false);

      // Now fetch agent dashboard using the resolved keys
      const response = await fetchAgentDetail(agentKey, tenantKey);
      if (response.success && response.data) {
        // Override name/sector with project DB values when available
        if (projName) response.data.name = projName;
        if (projSector) response.data.sector = projSector;

        setOriginalAgentData(response.data);
        setOriginalCalls(response.data.recentCalls);

        // For numeric project IDs with batches, auto-select the first batch
        // so KPIs + calls are scoped to real data instead of empty combined view
        const firstBatch = isNumericId && projId ? (await fetchProjectBatches(projId)).data?.[0] ?? null : null;

        if (isNumericId && projId && firstBatch) {
          setActiveBatchId(firstBatch.id);

          // Fetch batch-specific analytics + calls
          const [analyticsRes, callsRes] = await Promise.all([
            fetchProjectAnalytics(projId, firstBatch.id),
            fetchAgentCalls(agentKey, 1, 15, {}, tenantKey, firstBatch.id),
          ]);

          const kpiData = analyticsRes.success ? analyticsRes.data : null;
          const callsList = callsRes.success && callsRes.data ? callsRes.data : [];

          if (kpiData) {
            const isOutb = response.data.type === "Outbound";
            const livePct = kpiData.analysis_pct ?? 0;
            const liveAnalysed = kpiData.total_analysed ?? 0;

            const batchKpis: KpiItem[] = isOutb ? [
              { label: "Total Outbound Calls", value: String(kpiData.total_calls || 0), sub: "This batch" },
              { label: "Conversion Rate", value: `${Math.round((kpiData.conversion_rate || 0) * 100)}%`, sub: "Target: 25%", highlight: true },
              { label: "Callback Rate", value: `${Math.round((kpiData.callback_rate || 0) * 100)}%`, sub: "Scheduled follow-ups" },
              { label: "Avg Call Duration", value: formatDurationUtil(kpiData.avg_handle_time_secs || 0), sub: "Per completed call" },
              { label: "Conversations Analysed", value: `${liveAnalysed}`, sub: `${Math.round(livePct * 100)}% complete`, special: true },
            ] : [
              { label: "Total Inbound Calls", value: String(kpiData.total_calls || 0), sub: "This batch" },
              { label: "FCR Rate", value: `${Math.round((kpiData.fcr_rate || 0) * 100)}%`, sub: "Industry avg: 72%", highlight: true },
              { label: "Repeat Contacts", value: `${Math.round((kpiData.repeat_contact_rate || 0) * 100)}%`, sub: "% of all calls" },
              { label: "Avg Handle Time", value: formatDurationUtil(kpiData.avg_handle_time_secs || 0), sub: "Per resolved call" },
              { label: "Conversations Analysed", value: `${liveAnalysed}`, sub: `${Math.round(livePct * 100)}% complete`, special: true },
            ];

            response.data.kpis = batchKpis;
            response.data.analysedPct = Math.round(livePct * 100);
          }

          setAgentData(response.data);
          setInitialCalls(callsList);
        } else {
          setAgentData(response.data);
          setInitialCalls(response.data.recentCalls);
        }
      } else {
        setError(response.error?.message || "Failed to load agent data");
      }
      setIsLoading(false);
    }
    loadAll();
  }, [agentId]);

  const refreshBatches = useCallback(async () => {
    if (!projectId) return;
    const res = await fetchProjectBatches(projectId);
    if (res.success && res.data) {
      setBatches(res.data);
    }
  }, [projectId]);

  /** When batch changes: refetch KPIs + calls scoped to that batch */
  const handleBatchChange = useCallback(async (batchId: number | null) => {
    setActiveBatchId(batchId);
    setActiveFilters({});

    // "All Batches" → restore original dashboard data
    if (batchId === null) {
      if (originalAgentData) {
        setAgentData(originalAgentData);
        setInitialCalls(originalCalls);
      }
      return;
    }

    if (!projectId) return;

    const batchTenantId = projectTenantKey || tenantId;

    setIsLoading(true);

    const [analyticsRes, callsRes] = await Promise.all([
      fetchProjectAnalytics(projectId, batchId),
      fetchAgentCalls(effectiveAgentKey, 1, 15, {}, batchTenantId, batchId),
    ]);

    const kpiData = analyticsRes.success ? analyticsRes.data : null;
    const callsList = callsRes.success && callsRes.data ? callsRes.data : [];

    if (originalAgentData && kpiData) {
      const isOutb = originalAgentData.type === "Outbound";
      const livePct = kpiData.analysis_pct ?? 0;
      const liveAnalysed = kpiData.total_analysed ?? 0;

      const batchKpis: KpiItem[] = isOutb ? [
        { label: "Total Outbound Calls", value: String(kpiData.total_calls || 0), sub: "This batch" },
        { label: "Conversion Rate", value: `${Math.round((kpiData.conversion_rate || 0) * 100)}%`, sub: "Target: 25%", highlight: true },
        { label: "Callback Rate", value: `${Math.round((kpiData.callback_rate || 0) * 100)}%`, sub: "Scheduled follow-ups" },
        { label: "Avg Call Duration", value: formatDurationUtil(kpiData.avg_handle_time_secs || 0), sub: "Per completed call" },
        { label: "Conversations Analysed", value: `${liveAnalysed}`, sub: `${Math.round(livePct * 100)}% complete`, special: true },
      ] : [
        { label: "Total Inbound Calls", value: String(kpiData.total_calls || 0), sub: "This batch" },
        { label: "FCR Rate", value: `${Math.round((kpiData.fcr_rate || 0) * 100)}%`, sub: "Industry avg: 72%", highlight: true },
        { label: "Repeat Contacts", value: `${Math.round((kpiData.repeat_contact_rate || 0) * 100)}%`, sub: "% of all calls" },
        { label: "Avg Handle Time", value: formatDurationUtil(kpiData.avg_handle_time_secs || 0), sub: "Per resolved call" },
        { label: "Conversations Analysed", value: `${liveAnalysed}`, sub: `${Math.round(livePct * 100)}% complete`, special: true },
      ];

      setAgentData(prev => prev ? { ...prev, kpis: batchKpis, analysedPct: Math.round(livePct * 100) } : prev);
    }

    setInitialCalls(callsList);
    setIsLoading(false);
  }, [projectId, projectTenantKey, effectiveAgentKey, tenantId, originalAgentData, originalCalls]);

  /** Toggle a KPI filter key — table resets to page 1 */
  const handleKpiFilterToggle = useCallback((key: keyof CallFilters) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }, []);

  const agentName   = agentData?.name    || projectName || agentId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const agentType   = agentData?.type    || "Inbound";
  const agentSector = agentData?.sector  || projectSector || "Loading...";
  const agentAccent = agentData?.accent  || "#2563EB";
  const kpis: KpiItem[]  = agentData?.kpis || [];
  const analysedPct      = agentData?.analysedPct || 0;
  const isOutbound       = agentData?.type === "Outbound";

  // Chart data — preserved for when charts are re-enabled
  // const primaryChart    = agentData?.chartData.primary    || null;
  // const secondaryChart  = agentData?.chartData.secondary  || null;
  // const tertiaryChart   = agentData?.chartData.tertiary   || null;
  // const quaternaryChart = agentData?.chartData.quaternary || null;


  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <DashNav
        name={agentName}
        type={agentType}
        sector={agentSector}
        analysedPct={analysedPct}
        onImportClick={() => setShowImportModal(true)}
      />

      <main className="flex-1 overflow-y-auto p-7">
        {/* ── Batch Selector Strip ──────────────────────────────── */}
        {batchesLoading ? (
          <BatchSelectorSkeleton />
        ) : batches.length > 0 ? (
          <BatchSelector
            batches={batches}
            accent={agentAccent}
            onBatchChange={handleBatchChange}
          />
        ) : null}
        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red/30 bg-red/10 p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red">Failed to load dashboard data</p>
                <p className="mt-0.5 text-xs text-text2">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── KPI Strip — filterable cards ─────────────────────── */}
        <section className="mb-6 grid grid-cols-5 gap-3.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : kpis.length > 0 ? (
            kpis.map(kpi => (
              <FilterableKpiCard
                key={kpi.label}
                value={kpi.value}
                label={kpi.label}
                sub={kpi.sub}
                highlight={kpi.highlight}
                special={kpi.special}
                accent={agentAccent}
                activeFilters={activeFilters}
                onToggle={handleKpiFilterToggle}
              />
            ))
          ) : (
            Array.from({ length: 5 }).map((_, i) => <KpiEmptyCard key={i} index={i} />)
          )}
        </section>

        {/* ── Charts Row 1 — temporarily hidden ─────────────────────── */}
        {/* TODO: re-enable charts once chart rendering issues are resolved
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
                    Detailed FCR breakdown per query type with resolution counts,
                    trend analysis, and individual call references.
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
        */}

        {/* ── Charts Row 2 — temporarily hidden ─────────────────────── */}
        {/* TODO: re-enable charts
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
                    Full 30-day trend with spike annotations and top repeat callers list.
                  </p>
                }
              >
                <RepeatTrendChart data={tertiaryChart} accent={agentAccent} />
              </ChartCard>
              <ChartCard
                title={chartTitles.quaternary}
                expandedContent={
                  <p className="text-xs text-text3">
                    Escalation reason detail cards and most recent escalated calls.
                  </p>
                }
              >
                <EscalationChart data={quaternaryChart} />
              </ChartCard>
            </>
          )}
        </section>
        */}

        {/* ── Conversation Intelligence Insights ───────────────── */}
        {!isLoading && agentData?.insights && agentData.insights.length > 0 && (
          <InsightsGrid insights={agentData.insights} accent={agentAccent} />
        )}

        {/* ── Recent Conversations — filterable table ───────────── */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text3">
            Recent Conversations
            {Object.keys(activeFilters).length > 0 && (
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: `${agentAccent}22`, color: agentAccent }}
              >
                Filtered
              </span>
            )}
            <span className="h-px flex-1 bg-border" />
          </div>

          {isLoading ? (
            <DataTableSkeleton />
          ) : (
            <FilterableConversationsTable
              key={`${agentId}-${activeBatchId ?? "all"}`}
              agentId={effectiveAgentKey}
              tenantId={activeBatchId && projectTenantKey ? projectTenantKey : tenantId}
              initialCalls={initialCalls}
              kpis={kpis}
              accent={agentAccent}
              isOutbound={isOutbound}
              batchId={activeBatchId}
              externalFilters={activeFilters}
              onExternalFiltersChange={setActiveFilters}
            />
          )}
        </section>
      </main>

      {/* Upload status notification */}
      {uploadStatus && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          <div className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-blue border-t-transparent" />
          <span className="text-[13px] font-medium text-text1">{uploadStatus}</span>
        </div>
      )}

      {/* Batch Import Modal — reuses existing import wizard steps */}
      <BatchImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onBatchCreated={refreshBatches}
        onStatusChange={setUploadStatus}
        agentName={agentName}
        projectId={projectId}
      />
    </div>
  );
}

function formatDurationUtil(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

/** Empty KPI placeholder when no aggregate data yet */
function KpiEmptyCard({ index }: { index: number }) {
  const placeholders = [
    { label: "Total Inbound Calls",      sub: "Last 30 days" },
    { label: "FCR Rate",                 sub: "Industry avg: 72%", highlight: true },
    { label: "Repeat Contacts",          sub: "% of all calls" },
    { label: "Avg Handle Time",          sub: "Per resolved call" },
    { label: "Conversations Analysed",   sub: "Pending analysis", special: true },
  ];
  const p = placeholders[index] ?? placeholders[0];
  return (
    <div
      className={`rounded-xl border p-5 shadow-[var(--card-shadow)] ${
        p.highlight
          ? "border-blue/30 bg-card2"
          : p.special
          ? "border-green/20 bg-gradient-to-br from-green/4 to-card"
          : "border-border bg-card"
      }`}
    >
      <div className="text-[28px] font-extrabold tracking-tight text-text3/40">—</div>
      <div className="mt-1 text-xs font-medium text-text2">{p.label}</div>
      <div className="mt-1 text-[11px] text-text3">{p.sub}</div>
    </div>
  );
}

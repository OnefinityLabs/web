import { API_BASE_URL } from "./constants";
import type { 
  ApiResponse, 
  AgentSummary, 
  AgentDetail,
  ImportFormData,
  ImportETA,
  BatchInfo,
  ProjectDetail,
  InsightItem,
  RecentCall,
  CallFilters,
} from "./types";

export type { CallFilters };

/**
 * Typed fetch wrapper for backend API calls.
 * Handles auth headers, JSON parsing, and error normalization.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: {
          code: json?.error?.code ?? "HTTP_ERROR",
          message:
            json?.error?.message ?? `Request failed with status ${res.status}`,
        },
      };
    }

    return { success: true, data: json.data ?? json };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
    };
  }
}

/**
 * API Client Functions
 */

// Agent accent colors map
const AGENT_COLORS: Record<string, string> = {
  "inbound-support": "#7C3AED",
  "lead-gen": "#2563EB",
  "csat": "#10B981",
};

/**
 * GET /api/calls/agents
 * Fetch all agents with summary KPIs
 */
export async function fetchAgents(
  tenantId: string = "green-fortune"
): Promise<ApiResponse<AgentSummary[]>> {
  const response = await apiFetch<any[]>(
    `/api/calls/agents?tenantId=${tenantId}`
  );

  if (!response.success || !response.data) {
    return response as ApiResponse<AgentSummary[]>;
  }

  // Transform backend response to frontend AgentSummary format
  const agents: AgentSummary[] = response.data.map((agent: any) => {
    const kpis = agent.kpis || {};
    const status = agent.status || {};
    const accent = AGENT_COLORS[agent.id] || "#2563EB";

    // Determine project status
    let projectStatus: "live" | "ready" | "processing" = "live";
    if (status.total_pending > 0 && status.analysis_pct < 1) {
      projectStatus = "ready";
    } else if (!kpis || kpis.totalCalls === 0) {
      projectStatus = "ready";
    }

    // Calculate north star metric
    const isOutbound = typeof agent.direction === "string" ? agent.direction.toLowerCase() === "outbound" : false;
    const northStarValue = isOutbound
      ? Math.round((kpis.conversionRate || 0) * 100)
      : Math.round((kpis.fcrRate || 0) * 100);

    return {
      id: agent.id,
      name: agent.name || formatAgentName(agent.id),
      sector: agent.sector || "Financial Services",
      type: isOutbound ? "Outbound" : "Inbound",
      accent,
      northStar: {
        label: isOutbound ? "Conversion Rate" : "FCR Rate",
        value: `${northStarValue}%`,
        delta: "+2.3%",
        positive: true,
      },
      secondaryKpis: [
        {
          label: "Total Calls",
          value: String(kpis.totalCalls || 0),
        },
        {
          label: "Avg Sentiment",
          value: kpis.avgSentiment !== undefined && kpis.avgSentiment !== null ? Number(kpis.avgSentiment).toFixed(1) : "0.0",
        },
      ],
      sparkData: [65, 72, 68, 75, 80, 78, 85, 82, 88, 90, 87, 92],
      status: projectStatus,
      mode: "voice",
      processingInfo: projectStatus === "processing" ? {
        totalRecords: status.total_quality || 0,
        processedSoFar: status.total_analyzed || 0,
        etaMinutes: calculateETA((status.total_quality || 0) - (status.total_analyzed || 0)),
        source: "CSV Upload",
      } : undefined,
    };
  });

  return { success: true, data: agents };
}

/**
 * GET /api/calls/agent/:key
 * Fetch full agent details including KPIs, charts, and recent calls
 */
export async function fetchAgentDetail(
  agentKey: string,
  tenantId: string = "green-fortune"
): Promise<ApiResponse<AgentDetail>> {
  const response = await apiFetch<any>(
    `/api/calls/agent/${agentKey}?tenantId=${tenantId}`
  );

  const isOutbound = agentKey.includes("outbound") || agentKey.includes("lead-gen");
  const targetDirection = isOutbound ? "outbound" : "inbound";

  // Fetch true paginated calls with direction filter from backend
  const callsResponse = await apiFetch<any>(
    `/api/calls/agent/${agentKey}/calls?tenantId=${tenantId}&direction=${targetDirection}&limit=15&page=1`
  );

  if (!response.success || !response.data) {
    return response as ApiResponse<AgentDetail>;
  }

  const data = response.data;
  const callsData = callsResponse.success ? callsResponse.data : null;
  const kpis = data.kpis || {};
  const status = data.status || {};            // always live from getAnalysisStatus()
  const charts = data.charts || {};
  const accent = AGENT_COLORS[agentKey] || "#2563EB";

  // Live analysis percentage — use aggregated value if available, fall back to live count
  const livePct = kpis.analysis_pct ?? status.analysis_pct ?? 0;
  const liveAnalysed = kpis.total_analysed ?? status.total_analyzed ?? 0;
  const kpiItems = isOutbound ? [
    {
      label: "Total Outbound Calls",
      value: String(kpis.total_calls || 0),
      sub: "Last 30 days",
    },
    {
      label: "Conversion Rate",
      value: `${Math.round((kpis.conversion_rate || 0) * 100)}%`,
      sub: "Target: 25%",
      highlight: true,
    },
    {
      label: "Callback Rate",
      value: `${Math.round((kpis.callback_rate || 0) * 100)}%`,
      sub: "Scheduled follow-ups",
    },
    {
      label: "Avg Call Duration",
      value: formatDuration(kpis.avg_handle_time_secs || 0),
      sub: "Per completed call",
    },
    {
      label: "Conversations Analysed",
      value: `${liveAnalysed}`,
      sub: `${Math.round(livePct * 100)}% complete`,
      special: true,
    },
  ] : [
    {
      label: "Total Inbound Calls",
      value: String(kpis.total_calls || 0),
      sub: "Last 30 days",
    },
    {
      label: "FCR Rate",
      value: `${Math.round((kpis.fcr_rate || 0) * 100)}%`,
      sub: "Industry avg: 72%",
      highlight: true,
    },
    {
      label: "Repeat Contacts",
      value: `${Math.round((kpis.repeat_contact_rate || 0) * 100)}%`,
      sub: "% of all calls",
    },
    {
      label: "Avg Handle Time",
      value: formatDuration(kpis.avg_handle_time_secs || 0),
      sub: "Per resolved call",
    },
    {
      label: "Conversations Analysed",
      value: `${liveAnalysed}`,
      sub: `${Math.round(livePct * 100)}% complete`,
      special: true,
    },
  ];

  // Transform chart data
  const chartData = {
    primary: transformFCRChart(isOutbound ? (charts.outbound_outcomes || []) : (charts.fcr_by_query_type || [])),
    secondary: transformVolumeChart(charts.volume_by_query_type || []),
    tertiary: transformRepeatTrendChart(charts.repeat_trend || []),
    quaternary: transformEscalationChart(isOutbound ? (charts.outbound_outcomes || []) : (charts.escalation_reasons || [])),
  };

  // Generate insights from data
  const insights = generateInsights(kpis, charts, isOutbound);

  // Fetch filtered calls directly from the correct backend endpoint
  let callsList = callsData?.calls || [];

  // Transform recent calls — include all detail panel fields
  const recentCalls: RecentCall[] = callsList.map((call: any) => ({
    id:           typeof call.id === 'string' ? call.id.replace(/^F-/, "") : call.id,
    time:         call.time,
    duration:     call.duration,
    outcome:      call.outcome || "unknown",
    outcomeCls:   getOutcomeBadgeColor(call.outcome),
    sentiment:    call.sentiment || "neutral",
    sentCls:      getSentimentClass(call.sentiment),
    topic:        call.topic || "General inquiry",
    intent:       call.intent         ?? null,
    emotion:      call.emotion        ?? null,
    agentPerf:    call.agentPerf      ?? null,
    summary:      call.summary        ?? null,
    direction:    call.direction,
    fcrEligible:            call.fcrEligible    ?? null,
    isRepeatContact:        call.isRepeatContact ?? false,
    callbackRequested:      call.callbackRequested ?? null,
    escalationRisk:         call.escalationRisk ?? null,
    improvementSuggestions: call.improvementSuggestions ?? [],
    failureReasons:         call.failureReasons ?? [],
    flags:                  call.flags          ?? [],
    agentName:              call.agentName      ?? null,
    customerNumber:         call.customerNumber ?? null,
    transcriptLabeled:      call.transcriptLabeled ?? null,
  }));


  const agentDetail: AgentDetail = {
    id: agentKey,
    name: formatAgentName(agentKey),
    sector: "Financial Services",
    type: isOutbound ? "Outbound" : "Inbound",
    accent,
    kpis: kpiItems,
    charts: {
      primary: { title: isOutbound ? "Conversion by Outcome" : "FCR Rate by Query Type" },
      secondary: { title: "Call Volume by Query Type" },
      tertiary: { title: "Repeat Contact Trend (30 Days)" },
      quaternary: { title: isOutbound ? "Outbound Outcomes" : "Escalation Reasons" },
    },
    chartData,
    recentCalls,
    analysedPct: Math.round(livePct * 100),
    insights,
  };

  return { success: true, data: agentDetail };
}

/**
 * GET /api/calls/agent/:key/calls
 * Fetch paginated calls for an agent with optional KPI filters.
 * Filters map 1:1 to backend query params.
 */
export async function fetchAgentCalls(
  agentKey: string,
  page: number,
  limit: number = 15,
  filters: CallFilters = {},
  tenantId: string = "green-fortune",
  batchId?: number | null
): Promise<ApiResponse<RecentCall[]>> {
  const isOutbound = agentKey.includes("outbound") || agentKey.includes("lead-gen");

  const params = new URLSearchParams({
    tenantId,
    limit: String(limit),
    page: String(page),
  });

  // When viewing a specific batch, show all calls regardless of direction.
  // For the global/legacy view, filter by the project's primary direction.
  if (!batchId) {
    params.set("direction", isOutbound ? "outbound" : "inbound");
  }

  if (filters.fcr)        params.set("fcr",        "true");
  if (filters.repeat)     params.set("repeat",     "true");
  if (filters.conversion) params.set("conversion", "true");
  if (filters.callback)   params.set("callback",   "true");
  if (batchId)            params.set("batch",       String(batchId));

  const response = await apiFetch<any>(`/api/calls/agent/${agentKey}/calls?${params.toString()}`);

  if (!response.success || !response.data) {
    return response as ApiResponse<RecentCall[]>;
  }

  const callsList = response.data.calls || [];

  const recentCalls: RecentCall[] = callsList.map((call: any) => ({
    id:           typeof call.id === 'string' ? call.id.replace(/^F-/, "") : call.id,
    time:         call.time,
    duration:     call.duration,
    outcome:      call.outcome || "unknown",
    outcomeCls:   getOutcomeBadgeColor(call.outcome),
    sentiment:    call.sentiment || "neutral",
    sentCls:      getSentimentClass(call.sentiment),
    topic:        call.topic || "General inquiry",
    // Detail panel fields — passed through directly from backend
    intent:                 call.intent         ?? null,
    emotion:                call.emotion        ?? null,
    agentPerf:              call.agentPerf      ?? null,
    summary:                call.summary        ?? null,
    direction:              call.direction,
    fcrEligible:            call.fcrEligible    ?? null,
    isRepeatContact:        call.isRepeatContact ?? false,
    callbackRequested:      call.callbackRequested ?? null,
    escalationRisk:         call.escalationRisk ?? null,
    improvementSuggestions: call.improvementSuggestions ?? [],
    failureReasons:         call.failureReasons ?? [],
    flags:                  call.flags          ?? [],
    agentName:              call.agentName      ?? null,
    customerNumber:         call.customerNumber ?? null,
    analysisConfidence:     call.analysisConfidence ?? null,
    transcriptLabeled:      call.transcriptLabeled ?? null,
  }));

  return { success: true, data: recentCalls };
}


/**
 * POST /api/calls/ingest/:agentKey
 * Upload CSV file for ingestion
 */
export async function uploadCSV(
  agentKey: string,
  file: File,
  tenantId: string = "green-fortune"
): Promise<ApiResponse<{ filename: string; total: number; queued: number; skipped: number }>> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", tenantId);

    const res = await fetch(`${API_BASE_URL}/api/calls/ingest/${agentKey}`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: {
          code: json?.error?.code ?? "UPLOAD_ERROR",
          message: json?.error?.message ?? "Failed to upload file",
        },
      };
    }

    return { success: true, data: json.data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Upload failed",
      },
    };
  }
}

/**
 * POST /api/calls/process/:agentKey
 * Start processing uploaded calls
 */
export async function startProcessing(
  agentKey: string,
  tenantId: string = "green-fortune",
  limit?: number
): Promise<ApiResponse<{ message: string }>> {
  const queryParams = new URLSearchParams({ tenantId });
  if (limit) queryParams.append("limit", String(limit));

  return apiFetch<{ message: string }>(
    `/api/calls/process/${agentKey}?${queryParams.toString()}`,
    { method: "POST" }
  );
}

/**
 * GET /api/calls/agent/:key/status
 * Get processing status for polling
 */
export async function getProcessingStatus(
  agentKey: string,
  tenantId: string = "green-fortune"
): Promise<ApiResponse<{
  total_quality: number;
  total_analyzed: number;
  total_pending: number;
  analysis_pct: number;
}>> {
  return apiFetch(`/api/calls/agent/${agentKey}/status?tenantId=${tenantId}`);
}

/**
 * POST /api/calls/aggregate/:agentKey
 * Recompute KPIs and charts
 */
export async function aggregateAgent(
  agentKey: string,
  tenantId: string = "green-fortune"
): Promise<ApiResponse<any>> {
  return apiFetch(`/api/calls/aggregate/${agentKey}?tenantId=${tenantId}`, {
    method: "POST",
  });
}

// ═══════════════════════════════════════════════════════════════
// PROJECT & BATCH API — new batch system endpoints
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/projects
 * List all projects with their batches.
 */
export async function fetchProjects(): Promise<ApiResponse<ProjectDetail[]>> {
  return apiFetch<ProjectDetail[]>("/api/projects");
}

/**
 * GET /api/projects/:id
 * Single project with all its batches.
 */
export async function fetchProjectDetail(projectId: number): Promise<ApiResponse<ProjectDetail>> {
  return apiFetch<ProjectDetail>(`/api/projects/${projectId}`);
}

/**
 * GET /api/projects/:id/batches
 * List all batches for a project (newest first).
 */
export async function fetchProjectBatches(projectId: number): Promise<ApiResponse<BatchInfo[]>> {
  return apiFetch<BatchInfo[]>(`/api/projects/${projectId}/batches`);
}

/**
 * POST /api/projects/:id/batches
 * Upload a CSV file to create a new batch.
 */
export async function uploadBatch(
  projectId: number,
  file: File,
  label?: string,
  source?: string
): Promise<ApiResponse<{
  batch_id: number;
  label: string;
  project_id: number;
  total: number;
  queued: number;
  skipped: number;
}>> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (label) formData.append("label", label);
    if (source) formData.append("source", source);

    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/batches`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: {
          code: json?.error?.code ?? "UPLOAD_ERROR",
          message: json?.error?.message ?? "Failed to upload batch",
        },
      };
    }

    return { success: true, data: json.data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Upload failed",
      },
    };
  }
}

/**
 * POST /api/projects/:id/batches/:batchId/process
 * Start Whisper + GPT-4o analysis pipeline for a batch.
 */
export async function processBatch(
  projectId: number,
  batchId: number,
  options: { limit?: number; force?: boolean } = {}
): Promise<ApiResponse<{ message: string; batch_id: number; queued: number }>> {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(options.limit));
  if (options.force) params.set("force", "true");
  const qs = params.toString();

  return apiFetch(`/api/projects/${projectId}/batches/${batchId}/process${qs ? `?${qs}` : ""}`, {
    method: "POST",
  });
}

/**
 * GET /api/projects/:id/batches/:batchId/status
 * Poll live processing progress.
 */
export async function getBatchProcessingStatus(
  projectId: number,
  batchId: number
): Promise<ApiResponse<{
  batch_id: number;
  label: string;
  status: string;
  total: number;
  analyzed: number;
  pct: number;
  call_count: number;
  skipped_count: number;
}>> {
  return apiFetch(`/api/projects/${projectId}/batches/${batchId}/status`);
}

/**
 * GET /api/projects/:id/analytics?batch=:batchId
 * Pre-computed KPIs. Omit batch for all-batches combined.
 */
export async function fetchProjectAnalytics(
  projectId: number,
  batchId?: number
): Promise<ApiResponse<any>> {
  const qs = batchId ? `?batch=${batchId}` : "";
  return apiFetch(`/api/projects/${projectId}/analytics${qs}`);
}

/**
 * GET /api/projects/:id/calls?batch=:batchId
 * Paginated calls, optionally filtered by batch.
 */
export async function fetchProjectCalls(
  projectId: number,
  page: number = 1,
  limit: number = 15,
  options: { batchId?: number; direction?: string } = {}
): Promise<ApiResponse<{ calls: any[]; page: number; limit: number }>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.batchId) params.set("batch", String(options.batchId));
  if (options.direction) params.set("direction", options.direction);

  return apiFetch(`/api/projects/${projectId}/calls?${params.toString()}`);
}

/**
 * Find a project by its project_key from the projects list.
 * Returns the numeric project ID and batch list.
 */
export async function findProjectByKey(
  projectKey: string
): Promise<ApiResponse<ProjectDetail | null>> {
  const response = await fetchProjects();
  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || { code: "FETCH_ERROR", message: "Failed to load projects" },
    };
  }

  const project = response.data.find((p) => p.project_key === projectKey);
  return { success: true, data: project || null };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function formatAgentName(key: string): string {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function calculateETA(remaining: number): number {
  // Estimate: ~30 seconds per call (transcription + analysis)
  return Math.ceil((remaining * 30) / 60); // minutes
}

function getOutcomeBadgeColor(outcome: string): "blue" | "green" | "red" | "amber" | "grey" {
  const map: Record<string, "blue" | "green" | "red" | "amber" | "grey"> = {
    resolved: "green",
    escalated: "red",
    pending: "amber",
    no_answer: "grey",
    failed: "red",
    interested: "green",
    not_interested: "red",
    callback_scheduled: "blue",
  };
  return map[outcome] || "grey";
}

function getSentimentClass(sentiment: string): "pos" | "neg" | "neu" {
  if (sentiment === "positive") return "pos";
  if (sentiment === "negative" || sentiment === "frustrated") return "neg";
  return "neu";
}

// ═══════════════════════════════════════════════════════════════
// CHART DATA TRANSFORMERS
// ═══════════════════════════════════════════════════════════════

function transformFCRChart(data: any[]): { labels: string[]; values: number[]; colors?: string[] } {
  if (!data || data.length === 0) {
    return { labels: [], values: [] };
  }

  return {
    labels: data.map((d) => d.type || d.outcome || "Unknown"),
    values: data.map((d) => {
      // inbound format has .rate, outbound format has .percentage
      if (d.rate !== undefined) return Math.round((d.rate || 0) * 100);
      return d.percentage || 0;
    }),
  };
}

function transformVolumeChart(data: any[]): { labels: string[]; values: number[]; colors: string[] } {
  if (!data || data.length === 0) {
    return { labels: [], values: [], colors: [] };
  }

  const colors = ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#8B96B0"];

  return {
    labels: data.map((d) => d.type || "Unknown"),
    values: data.map((d) => d.count || 0),
    colors: data.map((_, i) => colors[i % colors.length]),
  };
}

function transformRepeatTrendChart(data: any[]): { labels: string[]; values: number[] } {
  if (!data || data.length === 0) {
    return { labels: [], values: [] };
  }

  return {
    labels: data.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    values: data.map((d) => d.count || 0),
  };
}

function transformEscalationChart(data: any[]): { labels: string[]; values: number[]; colors: string[] } {
  if (!data || data.length === 0) {
    return { labels: [], values: [], colors: [] };
  }

  const colors = ["#EF4444", "#F59E0B", "#8B96B0", "#7C3AED"];

  return {
    labels: data.map((d) => d.reason || d.outcome || "Unknown"),
    values: data.map((d) => d.count || 0),
    colors: data.map((_, i) => colors[i % colors.length]),
  };
}

// ═══════════════════════════════════════════════════════════════
// INSIGHTS GENERATOR
// ═══════════════════════════════════════════════════════════════

function generateInsights(kpis: any, charts: any, isOutbound: boolean): InsightItem[] {
  const insights: InsightItem[] = [];

  if (isOutbound) {
    // Outbound insights
    if (kpis.conversion_rate && kpis.conversion_rate > 0.2) {
      insights.push({
        icon: "📈",
        headline: "Strong Conversion Performance",
        text: `${Math.round(kpis.conversion_rate * 100)}% of outbound calls resulted in interested leads, exceeding the 20% benchmark.`,
        badge: "Positive Trend",
        badgeColor: "#10B981",
      });
    }

    if (kpis.callback_rate && kpis.callback_rate > 0.15) {
      insights.push({
        icon: "📞",
        headline: "High Callback Request Rate",
        text: `${Math.round(kpis.callback_rate * 100)}% of calls requested follow-up callbacks, indicating strong engagement.`,
        badge: "Opportunity",
        badgeColor: "#2563EB",
      });
    }
  } else {
    // Inbound insights
    if (kpis.repeat_contact_rate && kpis.repeat_contact_rate > 0.15) {
      insights.push({
        icon: "🔄",
        headline: "Repeat Contact Spike",
        text: `${Math.round(kpis.repeat_contact_rate * 100)}% of customers are calling back within 7 days, indicating potential FCR issues.`,
        badge: "High Priority",
        badgeColor: "#EF4444",
      });
    }

    if (kpis.escalation_rate && kpis.escalation_rate > 0.1) {
      insights.push({
        icon: "⚠️",
        headline: "Escalation Rate Above Target",
        text: `${Math.round(kpis.escalation_rate * 100)}% of calls are being escalated, exceeding the 10% target.`,
        badge: "Action Required",
        badgeColor: "#F59E0B",
      });
    }

    // Top escalation reason
    if (charts.escalation_reasons && charts.escalation_reasons.length > 0) {
      const topReason = charts.escalation_reasons[0];
      insights.push({
        icon: "🎯",
        headline: "Top Escalation Driver",
        text: `"${topReason.reason}" accounts for ${topReason.percentage}% of all escalations. Focus training here.`,
        badge: "Insight",
        badgeColor: "#7C3AED",
      });
    }
  }

  // Sentiment insight (both directions)
  if (kpis.avg_sentiment_score && kpis.avg_sentiment_score < -0.2) {
    insights.push({
      icon: "😟",
      headline: "Sentiment Alert",
      text: `Average sentiment score is ${kpis.avg_sentiment_score.toFixed(2)}, indicating customer frustration trends.`,
      badge: "Monitor",
      badgeColor: "#EF4444",
    });
  }

  return insights;
}

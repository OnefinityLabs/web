import { API_BASE_URL } from "./constants";
import type { ApiResponse, AgentSummary, AgentDetail } from "./types";

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
  "lending-inbound": "#2563EB",
  "lending-outbound": "#7C3AED",
  "collections": "#10B981",
};

/**
 * GET /api/poc/agents
 * Fetch all agents with summary KPIs
 */
export async function fetchAgents(
  tenantId: string = "finserve-lending"
): Promise<ApiResponse<AgentSummary[]>> {
  const response = await apiFetch<any[]>(
    `/api/poc/agents?tenantId=${tenantId}`
  );

  if (!response.success || !response.data) {
    return response as ApiResponse<AgentSummary[]>;
  }

  // Transform backend response to frontend AgentSummary format
  const agents: AgentSummary[] = response.data.map((agent: any) => {
    const kpis = agent.kpis || {};
    const accent = AGENT_COLORS[agent.id] || "#2563EB";

    return {
      id: agent.id,
      name: agent.name,
      sector: agent.sector,
      type: agent.direction === "outbound" ? "Outbound" : "Inbound",
      accent,
      northStar: {
        label:
          agent.direction === "outbound"
            ? "Conversion Rate"
            : "First Call Resolution",
        value: agent.direction === "outbound" 
          ? `${kpis.conversionRate || 0}%`
          : `${kpis.fcrRate || 0}%`,
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
          value: kpis.avgSentiment ? kpis.avgSentiment.toFixed(1) : "0.0",
        },
      ],
      sparkData: [65, 72, 68, 75, 80, 78, 85, 82, 88, 90, 87, 92],
    };
  });

  return { success: true, data: agents };
}

/**
 * GET /api/poc/agent/:key
 * Fetch full agent details including KPIs, charts, and recent calls
 */
export async function fetchAgentDetail(
  agentKey: string,
  tenantId: string = "finserve-lending"
): Promise<ApiResponse<AgentDetail>> {
  const response = await apiFetch<any>(
    `/api/poc/agent/${agentKey}?tenantId=${tenantId}`
  );

  if (!response.success || !response.data) {
    return response as ApiResponse<AgentDetail>;
  }

  const data = response.data;
  const kpis = data.kpis || {};
  const charts = data.charts || {};
  const accent = AGENT_COLORS[agentKey] || "#2563EB";

  // Transform to AgentDetail format
  const agentDetail: AgentDetail = {
    id: agentKey,
    name: agentKey.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    sector: "Financial Services",
    type: agentKey.includes("outbound") ? "Outbound" : "Inbound",
    accent,
    kpis: [
      {
        label: "Total Calls",
        value: String(kpis.total_calls || 0),
        sub: `${kpis.calls_answered || 0} answered`,
      },
      {
        label: "Avg Duration",
        value: kpis.avg_duration_min ? `${kpis.avg_duration_min.toFixed(1)}m` : "0m",
      },
      {
        label: "FCR Rate",
        value: `${kpis.fcr_rate || 0}%`,
        highlight: true,
      },
      {
        label: "Avg Sentiment",
        value: kpis.avg_sentiment_score ? kpis.avg_sentiment_score.toFixed(2) : "0.00",
      },
      {
        label: "Analysis Progress",
        value: `${kpis.analysis_pct || 0}%`,
        special: true,
      },
    ],
    charts: {
      primary: { title: "Call Volume Trend" },
      secondary: { title: "Sentiment Distribution" },
      tertiary: { title: "Top Topics" },
      quaternary: { title: "Call Outcomes" },
    },
    chartData: {
      primary: {
        labels: charts.volume_trend?.labels || [],
        values: charts.volume_trend?.values || [],
      },
      secondary: {
        labels: charts.sentiment_dist?.labels || ["Positive", "Neutral", "Negative"],
        values: charts.sentiment_dist?.values || [0, 0, 0],
        colors: ["#10B981", "#8B96B0", "#EF4444"],
      },
      tertiary: {
        labels: charts.top_topics?.labels || [],
        values: charts.top_topics?.values || [],
      },
      quaternary: {
        labels: charts.outcome_dist?.labels || ["Resolved", "Escalated", "Pending"],
        values: charts.outcome_dist?.values || [0, 0, 0],
        colors: ["#10B981", "#EF4444", "#F59E0B"],
      },
    },
    recentCalls: (data.recentCalls?.rows || []).map((call: any) => ({
      id: call.cx_call_id,
      time: new Date(call.call_start_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`,
      outcome: call.call_outcome || "unknown",
      outcomeCls: getOutcomeBadgeColor(call.call_outcome),
      sentiment: call.sentiment_label || "neutral",
      sentCls: getSentimentClass(call.sentiment_label),
      topic: call.key_topic || "General inquiry",
    })),
    analysedPct: kpis.analysis_pct || 0,
  };

  return { success: true, data: agentDetail };
}

// Helper functions
function getOutcomeBadgeColor(outcome: string): "blue" | "green" | "red" | "amber" | "grey" {
  const map: Record<string, "blue" | "green" | "red" | "amber" | "grey"> = {
    resolved: "green",
    escalated: "red",
    pending: "amber",
    no_answer: "grey",
    failed: "red",
  };
  return map[outcome] || "grey";
}

function getSentimentClass(sentiment: string): "pos" | "neg" | "neu" {
  if (sentiment === "positive") return "pos";
  if (sentiment === "negative" || sentiment === "frustrated") return "neg";
  return "neu";
}

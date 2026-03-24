/* ═══════════════════════════════════════════════════════════
   TypeScript interfaces for the Conviq POC
   All shapes match the backend API responses
   ═══════════════════════════════════════════════════════════ */

/** Badge variant for agent type */
export type AgentType = "Outbound" | "Inbound";

/** Sentiment labels from LLM analysis */
export type SentimentLabel = "positive" | "neutral" | "negative" | "frustrated";

/** Call outcome from LLM classification */
export type CallOutcome =
  | "resolved"
  | "escalated"
  | "pending"
  | "no_answer"
  | "failed";

/** Badge color key for outcome styling */
export type OutcomeBadgeColor = "blue" | "green" | "red" | "amber" | "grey";

/* ── Agent Overview (Home Page) ──────────────────────────── */

export interface SecondaryKpi {
  label: string;
  value: string;
}

export interface NorthStar {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface AgentSummary {
  id: string;
  name: string;
  sector: string;
  type: AgentType;
  accent: string;
  northStar: NorthStar;
  secondaryKpis: SecondaryKpi[];
  sparkData: number[];
}

/* ── KPI Strip (Dashboard) ───────────────────────────────── */

export interface KpiItem {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  special?: boolean;
}

/* ── Charts ──────────────────────────────────────────────── */

export interface ChartDataset {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface DoughnutDataset {
  labels: string[];
  values: number[];
  colors: string[];
}

/* ── Recent Conversations Table ──────────────────────────── */

export interface RecentCall {
  id: string;
  time: string;
  duration: string;
  outcome: string;
  outcomeCls: OutcomeBadgeColor;
  sentiment: string;
  sentCls: "pos" | "neg" | "neu";
  topic: string;
}

/* ── Agent Dashboard (Full Detail) ───────────────────────── */

export interface AgentChartConfig {
  primary: { title: string };
  secondary: { title: string };
  tertiary: { title: string };
  quaternary: { title: string };
}

export interface AgentDetail {
  id: string;
  name: string;
  sector: string;
  type: AgentType;
  accent: string;
  kpis: KpiItem[];
  charts: AgentChartConfig;
  chartData: {
    primary: ChartDataset;
    secondary: DoughnutDataset;
    tertiary: ChartDataset;
    quaternary: DoughnutDataset;
  };
  recentCalls: RecentCall[];
  analysedPct: number;
}

/* ── API Response wrappers ───────────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

/* ── Loading State ───────────────────────────────────────── */

export type LoadingState = "idle" | "loading" | "success" | "error";

/* ═══════════════════════════════════════════════════════════
   TypeScript interfaces for Conviq
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

export interface BatchInfo {
  id: number;
  label: string;
  status: "ingesting" | "pending" | "analyzing" | "ready" | "failed";
  call_count: number;
  queued_count: number;
  skipped_count: number;
  source: string;
  original_filename: string;
  date_from: string | null;
  date_to: string | null;
  created_at: string;
  project_id: number;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string | null;
  project_key: string;
  tenant_config_key: string;
  call_types: string;
  active_flag: boolean;
  created_at: string;
  project_types: { name: string; description?: string } | null;
  cdr_batch: BatchInfo[];
}

export interface ProcessingInfo {
  totalRecords: number;
  processedSoFar: number;
  etaMinutes: number;
  source: string;
  batchLabel?: string;
}

export type ProjectStatus = "live" | "ready" | "processing";
export type ProjectMode = "voice" | "intelligence-only" | "blended";

export interface AgentSummary {
  id: string;
  name: string;
  sector: string;
  type: AgentType;
  accent: string;
  northStar: NorthStar;
  secondaryKpis: SecondaryKpi[];
  sparkData: number[];
  // NEW FIELDS
  status?: ProjectStatus;
  mode?: ProjectMode;
  hasBatches?: boolean;
  batches?: BatchInfo[];
  processingInfo?: ProcessingInfo;
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

export interface CallFilters {
  fcr?:        boolean;
  repeat?:     boolean;
  conversion?: boolean;
  callback?:   boolean;
}

export interface RecentCall {
  id:          string;
  time:        string;
  duration:    string;
  outcome:     string;
  outcomeCls:  OutcomeBadgeColor;
  sentiment:   string;
  sentCls:     "pos" | "neg" | "neu";
  topic:        string;
  // Detail panel fields
  intent?:      string | null;
  emotion?:     string | null;
  agentPerf?:   string | null;
  summary?:     string | null;
  direction?:   string;
  fcrEligible?: boolean | null;
  isRepeatContact?: boolean;
  callbackRequested?: boolean | null;
  escalationRisk?:    number | null;
  improvementSuggestions?: string[];
  failureReasons?: Array<{ category: string; confidence: number; explanation: string }>;
  flags?:       string[];
  agentName?:   string | null;
  customerNumber?: string | null;
  /** LLM self-reported confidence in the analysis (0.0–1.0). null = not yet analyzed */
  analysisConfidence?: number | null;
  /** Speaker-labeled transcript turns from pyannote + GPT. null if diarization didn't run */
  transcriptLabeled?: Array<{ label: string; start: number; end: number; text: string }> | null;
}



/* ── Agent Dashboard (Full Detail) ───────────────────────── */

export interface AgentChartConfig {
  primary: { title: string };
  secondary: { title: string };
  tertiary: { title: string };
  quaternary: { title: string };
}

export interface InsightItem {
  icon: string;
  headline: string;
  text: string;
  badge: string;
  badgeColor: string;
}

export interface TabData {
  kpis: KpiItem[];
  chartData: {
    primary: ChartDataset;
    secondary: DoughnutDataset;
    tertiary: ChartDataset;
    quaternary: DoughnutDataset;
  };
  recentCalls: RecentCall[];
  insights?: InsightItem[];
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
  // NEW FIELDS
  insights?: InsightItem[];
  hasTabs?: boolean;
  tabData?: {
    inbound: TabData;
    outbound: TabData;
  };
  hasBatches?: boolean;
  batches?: BatchInfo[];
}

/* ── API Response wrappers ───────────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

/* ── Loading State ───────────────────────────────────────── */

export type LoadingState = "idle" | "loading" | "success" | "error";

/* ── Import Records ──────────────────────────────────────── */

export type ImportSource = 
  | "Genesys"
  | "Smartflo"
  | "Exotel"
  | "Knowlarity"
  | "Vapi"
  | "Other";

export interface ImportFormData {
  source: ImportSource;
  projectName: string;
  batchLabel: string;
  dateFrom: string;
  dateTo: string;
  file?: File;
  recordCount?: number;
}

export interface ImportETA {
  totalRecords: number;
  estimatedMinutes: number;
  source: string;
}

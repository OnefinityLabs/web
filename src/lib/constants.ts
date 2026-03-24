/* ═══════════════════════════════════════════════════════════
   Design-system constants — colors, chart theme, etc.
   Single source of truth for the whole UI
   ═══════════════════════════════════════════════════════════ */

/** Outcome badge style map (background + text) */
export const OUTCOME_STYLES: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(37,99,235,0.18)", text: "#60A5FA" },
  green: { bg: "rgba(16,185,129,0.18)", text: "#34D399" },
  red: { bg: "rgba(239,68,68,0.18)", text: "#FCA5A5" },
  amber: { bg: "rgba(245,158,11,0.18)", text: "#FCD34D" },
  grey: { bg: "rgba(107,114,128,0.18)", text: "#9CA3AF" },
};

/** Sentiment display config */
export const SENTIMENT_CONFIG: Record<
  string,
  { emoji: string; label: string; cls: string }
> = {
  pos: { emoji: "😊", label: "Positive", cls: "text-green" },
  neg: { emoji: "😟", label: "Negative", cls: "text-red" },
  neu: { emoji: "😐", label: "Neutral", cls: "text-text3" },
};

/** Shared Chart.js theme colors */
export const CHART_THEME = {
  fontFamily: "'Inter', sans-serif",
  gridColor: "rgba(255,255,255,0.05)",
  tickColor: "#4B5A72",
  tooltipBg: "#0C1525",
  tooltipBorder: "#1A2B44",
  labelColor: "#8B96B0",
} as const;

/** 7-palette for chart datasets */
export const CHART_PALETTE = [
  "#2563EB",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#F472B6",
] as const;

/** Backend API base URL — set via env or fallback */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

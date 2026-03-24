"use client";

import { CHART_THEME } from "@/lib/constants";
import type { ChartOptions } from "chart.js";

/**
 * Shared Chart.js options generator — dark theme matching the HTML dashboard.
 */
export function baseChartOptions(
  overrides: Partial<ChartOptions<"bar" | "line" | "doughnut">> = {}
): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_THEME.tooltipBg,
        borderColor: CHART_THEME.tooltipBorder,
        borderWidth: 1,
        titleColor: "#EEF2FF",
        bodyColor: "#8B96B0",
        titleFont: { family: CHART_THEME.fontFamily, size: 12, weight: "bold" },
        bodyFont: { family: CHART_THEME.fontFamily, size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: CHART_THEME.gridColor },
        ticks: {
          color: CHART_THEME.tickColor,
          font: { family: CHART_THEME.fontFamily, size: 11 },
        },
      },
      y: {
        grid: { color: CHART_THEME.gridColor },
        ticks: {
          color: CHART_THEME.tickColor,
          font: { family: CHART_THEME.fontFamily, size: 11 },
        },
      },
    },
    ...overrides,
  } as ChartOptions<"bar">;
}

/** Default doughnut options (no scales) */
export function baseDoughnutOptions(): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: CHART_THEME.labelColor,
          font: { family: CHART_THEME.fontFamily, size: 11 },
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: CHART_THEME.tooltipBg,
        borderColor: CHART_THEME.tooltipBorder,
        borderWidth: 1,
        titleColor: "#EEF2FF",
        bodyColor: "#8B96B0",
        padding: 10,
        cornerRadius: 8,
      },
    },
  };
}

// @ts-nocheck
"use client";

import { Bar } from "react-chartjs-2";
import { baseChartOptions } from "./chartConfig";
import { ensureChartsRegistered } from "./register";
import { CHART_THEME } from "@/lib/constants";
import type { ChartDataset } from "@/lib/types";

ensureChartsRegistered();

interface FcrQueryChartProps {
  data: ChartDataset | null;
  accent?: string;
}

/**
 * FCR Rate by Query Type — horizontal bar chart.
 * Bars color-coded: green ≥ 70%, amber ≥ 50%, red < 50%.
 */
export function FcrQueryChart({
  data,
  accent = "#7C3AED",
}: FcrQueryChartProps) {
  if (!data) return <EmptyChartState />;

  const colors = data.values.map((v) =>
    v >= 70 ? accent : v >= 50 ? "#F59E0B" : "#EF4444"
  );

  return (
    <div className="h-60">
      <Bar
        data={{
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              backgroundColor: colors,
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        }}
        options={
          {
            ...baseChartOptions(),
            indexAxis: "y" as const,
            scales: {
              x: {
                grid: { color: CHART_THEME.gridColor },
                ticks: {
                  color: CHART_THEME.tickColor,
                  font: { family: CHART_THEME.fontFamily, size: 11 },
                },
                min: 0,
                max: 100,
              },
              y: {
                grid: { display: false },
                ticks: {
                  color: "#8B96B0",
                  font: { family: CHART_THEME.fontFamily, size: 11 },
                },
              },
            },
          } as Parameters<typeof Bar>[0]["options"]
        }
      />
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-60 items-center justify-center text-text3">
      <div className="text-center">
        <p className="text-sm">No data available</p>
        <p className="mt-1 text-xs opacity-60">Connect the backend to load chart data</p>
      </div>
    </div>
  );
}

"use client";

import { Line } from "react-chartjs-2";
import { baseChartOptions } from "./chartConfig";
import { ensureChartsRegistered } from "./register";
import { CHART_THEME } from "@/lib/constants";
import type { ChartDataset } from "@/lib/types";

ensureChartsRegistered();

interface RepeatTrendChartProps {
  data: ChartDataset | null;
  accent?: string;
}

/**
 * Repeat Contact Trend — area line chart over 30 days.
 */
export function RepeatTrendChart({
  data,
  accent = "#7C3AED",
}: RepeatTrendChartProps) {
  if (!data) return <EmptyChartState />;

  return (
    <div className="h-52">
      <Line
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Repeat Contacts",
              data: data.values,
              borderColor: accent,
              backgroundColor: `${accent}22`,
              tension: 0.3,
              fill: true,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        }}
        options={
          {
            ...baseChartOptions(),
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: CHART_THEME.tickColor,
                  font: { family: CHART_THEME.fontFamily, size: 10 },
                  maxTicksLimit: 8,
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
          } as Parameters<typeof Line>[0]["options"]
        }
      />
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-52 items-center justify-center text-text3">
      <div className="text-center">
        <p className="text-sm">No data available</p>
        <p className="mt-1 text-xs opacity-60">Connect the backend to load chart data</p>
      </div>
    </div>
  );
}

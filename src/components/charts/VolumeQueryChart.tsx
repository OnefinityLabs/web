// @ts-nocheck
"use client";

import { Doughnut } from "react-chartjs-2";
import { baseDoughnutOptions } from "./chartConfig";
import { ensureChartsRegistered } from "./register";
import type { DoughnutDataset } from "@/lib/types";

ensureChartsRegistered();

interface VolumeQueryChartProps {
  data: DoughnutDataset | null;
}

/**
 * Call Volume by Query Type — doughnut chart with right-aligned legend.
 */
export function VolumeQueryChart({ data }: VolumeQueryChartProps) {
  if (!data) return <EmptyChartState />;

  return (
    <div className="h-60">
      <Doughnut
        data={{
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              backgroundColor: data.colors,
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        }}
        options={baseDoughnutOptions()}
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

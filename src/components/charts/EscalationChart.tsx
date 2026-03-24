"use client";

import { Doughnut } from "react-chartjs-2";
import { baseDoughnutOptions } from "./chartConfig";
import { ensureChartsRegistered } from "./register";
import type { DoughnutDataset } from "@/lib/types";

ensureChartsRegistered();

interface EscalationChartProps {
  data: DoughnutDataset | null;
}

/**
 * Escalation Reasons — doughnut chart with right legend.
 */
export function EscalationChart({ data }: EscalationChartProps) {
  if (!data) return <EmptyChartState />;

  return (
    <div className="h-52">
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
    <div className="flex h-52 items-center justify-center text-text3">
      <div className="text-center">
        <p className="text-sm">No data available</p>
        <p className="mt-1 text-xs opacity-60">Connect the backend to load chart data</p>
      </div>
    </div>
  );
}

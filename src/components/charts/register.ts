"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

/** Register all Chart.js components — call once at app level */
export function registerCharts() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Tooltip,
    Legend
  );
}

let registered = false;

export function ensureChartsRegistered() {
  if (!registered) {
    registerCharts();
    registered = true;
  }
}

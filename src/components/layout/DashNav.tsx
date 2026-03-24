"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface DashNavProps {
  name: string;
  type: "Outbound" | "Inbound";
  sector: string;
  analysedPct: number;
}

export function DashNav({ name, type, sector, analysedPct }: DashNavProps) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface px-8 py-3">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-text2 transition-colors hover:border-border2 hover:text-text1"
        >
          ← All Agents
        </Link>
        <div>
          <div className="text-base font-bold text-text1">{name}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge variant={type === "Outbound" ? "outbound" : "inbound"}>
              {type}
            </Badge>
            <Badge variant="live" dotBefore>
              Live
            </Badge>
            <span className="ml-1 text-xs text-text3">{sector}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-green/80">
          <span className="inline-block h-[7px] w-[7px] animate-pulse-glow rounded-full bg-green shadow-[0_0_6px] shadow-green" />
          {analysedPct}% of conversations analysed
        </div>
        <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] text-text2 outline-none">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
        {/* <button
          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-card text-[15px] text-text2 transition-colors hover:border-border2 hover:text-text1"
          title="Export"
        >
          ↓
        </button>
        <button
          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-card text-[15px] text-text2 transition-colors hover:border-border2 hover:text-text1"
          title="Share"
        >
          ⤴
        </button> */}
      </div>
    </nav>
  );
}

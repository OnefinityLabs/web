"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProfileCard } from "./ProfileCard";

interface DashNavProps {
  name: string;
  type: "Outbound" | "Inbound";
  sector: string;
  analysedPct: number;
  onImportClick?: () => void;
}

export function DashNav({ name, type, sector, analysedPct, onImportClick }: DashNavProps) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface px-8 py-3">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-text2 transition-colors hover:border-border2 hover:text-text1"
        >
          ← Projects
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
        {onImportClick && (
          <button
            onClick={onImportClick}
            className="flex items-center gap-1.5 rounded-lg border border-blue/30 bg-blue/8 px-3.5 py-1.5 text-[12px] font-semibold text-blue transition-all hover:border-blue/50 hover:bg-blue/15 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Batch
          </button>
        )}
        <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] text-text2 outline-none">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
        <ProfileCard />
      </div>
    </nav>
  );
}

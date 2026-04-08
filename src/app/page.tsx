"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { AgentCard, AgentCardSkeleton } from "@/components/agent/AgentCard";
import { fetchProjects } from "@/lib/api";
import type { AgentSummary, ProjectDetail } from "@/lib/types";

const ACCENT_COLORS = ["#7C3AED", "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#0891B2"];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

/** Map a DB project to the AgentSummary shape that AgentCard expects */
function projectToAgentSummary(p: ProjectDetail, index: number): AgentSummary {
  const isOutbound = (p.call_types ?? "").toLowerCase().includes("outbound");
  const batches = p.cdr_batch ?? [];
  const totalCalls = batches.reduce((s, b) => s + (b.call_count ?? 0), 0);
  const totalQueued = batches.reduce((s, b) => s + (b.queued_count ?? 0), 0);
  const analyzing = batches.some(b => b.status === "analyzing" || b.status === "ingesting");

  let status: "live" | "ready" | "processing" = "live";
  if (analyzing || totalQueued > 0) {
    status = "processing";
  } else if (totalCalls === 0) {
    status = "ready";
  }

  return {
    id: String(p.id),
    name: p.name,
    sector: p.project_types?.name ?? "General",
    type: isOutbound ? "Outbound" : "Inbound",
    accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
    northStar: {
      label: isOutbound ? "Conversion Rate" : "FCR Rate",
      value: "0%",
      delta: "+2.3%",
      positive: true,
    },
    secondaryKpis: [
      { label: "Total Calls", value: String(totalCalls) },
      { label: "Avg Sentiment", value: "0.0" },
    ],
    sparkData: [65, 72, 68, 75, 80, 78, 85, 82, 88, 90, 87, 92],
    status,
    mode: "voice",
    hasBatches: batches.length > 0,
    processingInfo: status === "processing" ? {
      totalRecords: totalCalls,
      processedSoFar: totalCalls - totalQueued,
      etaMinutes: Math.ceil((totalQueued * 30) / 60),
      source: "CSV Upload",
    } : undefined,
  };
}

export default function HomePage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      setError(null);

      const response = await fetchProjects();

      if (response.success && response.data) {
        setAgents(response.data.map((p, i) => projectToAgentSummary(p, i)));
      } else {
        setError(response.error?.message || "Failed to load projects");
      }

      setIsLoading(false);
    }

    loadProjects();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopNav agentCount={agents.length} title="Projects" />

      <main className="flex-1 px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-text1">
            {greeting}, 👋
          </h1>
          <p className="mt-1.5 text-sm text-text2">
            {agents.length} projects running · All systems operational · Last
            refreshed just now
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red/30 bg-red/10 p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red">
                  Failed to load projects
                </p>
                <p className="mt-0.5 text-xs text-text2">{error}</p>
              </div>
              <button className="ml-auto rounded-lg border border-red/30 px-3 py-1 text-xs font-medium text-red transition-colors hover:bg-red/10">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-5">
            <AgentCardSkeleton />
            <AgentCardSkeleton />
            <AgentCardSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && agents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-text3"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text1">
              No projects yet
            </h2>
          </div>
        )}

        {/* Project Grid */}
        {!isLoading && agents.length > 0 && (
          <div className="grid grid-cols-3 gap-5">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { AgentCard, AgentCardSkeleton } from "@/components/agent/AgentCard";
import { fetchAgents } from "@/lib/api";
import type { AgentSummary } from "@/lib/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
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
    let timeoutId: NodeJS.Timeout;

    async function loadAgents(isInitial = false) {
      if (isInitial) {
        setIsLoading(true);
        setError(null);
      }

      const response = await fetchAgents();

      if (response.success && response.data) {
        setAgents(response.data);

        if (response.data.some((agent) => agent.status === "processing")) {
          timeoutId = setTimeout(() => loadAgents(false), 3000);
        }
      } else if (isInitial) {
        setError(response.error?.message || "Failed to load agents");
      }

      if (isInitial) {
        setIsLoading(false);
      }
    }

    loadAgents(true);

    return () => clearTimeout(timeoutId);
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
                  Failed to load agents
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
              No agents loaded
            </h2>
          </div>
        )}

        {/* Agent Grid */}
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

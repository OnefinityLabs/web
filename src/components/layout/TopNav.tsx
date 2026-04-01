"use client";

import { useRouter } from "next/navigation";
import { ProfileCard } from "./ProfileCard";

interface TopNavProps {
  agentCount?: number;
  title?: string;
  showBackButton?: boolean;
  showImportButton?: boolean;
  onBack?: () => void;
}

export function TopNav({
  agentCount = 0,
  title,
  showBackButton = false,
  showImportButton = true,
  onBack,
}: TopNavProps) {
  const router = useRouter();

  const handleImport = () => {
    router.push("/import");
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-border bg-surface px-8">
      <div className="flex items-center gap-5">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-text2 transition-colors hover:border-border2 hover:text-text1"
          >
            ← Back to Projects
          </button>
        )}
        <div className="text-xl font-extrabold tracking-tight text-blue-l">
          conviq{" "}
          <span className="ml-3 text-sm font-normal text-text3">
            / {title || "Projects"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {agentCount > 0 && (
          <span className="rounded-full bg-blue-dim px-2.5 py-1 text-[11px] font-semibold tracking-wide text-blue-l">
            {agentCount} Projects
          </span>
        )}
        {showImportButton && !showBackButton && (
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded-lg border border-blue/30 bg-blue/15 px-3.5 py-2 text-xs font-semibold text-blue-l transition-colors hover:border-blue/50 hover:bg-blue/25"
          >
            ⬆ Import Records
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

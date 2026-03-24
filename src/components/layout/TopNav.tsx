interface TopNavProps {
  agentCount?: number;
}

export function TopNav({ agentCount = 0 }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-border bg-surface px-8">
      <div className="flex items-center gap-5">
        <div className="text-xl font-extrabold tracking-tight text-blue-l">
          conviq{" "}
          <span className="ml-3 text-sm font-normal text-text3">
            / Agent Overview
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {agentCount > 0 && (
          <span className="rounded-full bg-blue-dim px-2.5 py-1 text-[11px] font-semibold tracking-wide text-blue-l">
            {agentCount} Agents · Live
          </span>
        )}
        <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] text-text2 outline-none">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-blue to-purple text-[13px] font-bold text-white">
          MJ
        </div>
      </div>
    </nav>
  );
}

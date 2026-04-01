interface KpiCardProps {
  value: string;
  label: string;
  sub?: string;
  highlight?: boolean;
  special?: boolean;
  accent?: string;
}

export function KpiCard({
  value,
  label,
  sub,
  highlight = false,
  special = false,
  accent,
}: KpiCardProps) {
  const border = highlight
    ? "border-blue"
    : special
      ? "border-green/40"
      : "border-border";

  const bg = highlight
    ? "bg-card2"
    : special
      ? "bg-gradient-to-br from-green/6 to-card"
      : "bg-card";

  const valueColor = highlight
    ? accent
      ? `text-[${accent}]`
      : "text-blue"
    : special
      ? "text-green"
      : "text-text1";

  return (
    <div className={`rounded-xl border p-5 shadow-[var(--card-shadow)] ${border} ${bg}`}>
      <div
        className={`text-[28px] font-extrabold tracking-tight ${valueColor}`}
        style={highlight && accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-text2">{label}</div>
      {sub && (
        <div
          className={`mt-1 text-[11px] ${special ? "text-green/70" : "text-text3"}`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/** Skeleton placeholder for KPI cards during loading */
export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--card-shadow)]">
      <div className="skeleton h-8 w-20" />
      <div className="skeleton mt-2 h-3 w-28" />
      <div className="skeleton mt-2 h-3 w-24" />
    </div>
  );
}

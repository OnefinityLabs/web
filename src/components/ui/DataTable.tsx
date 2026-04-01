import type { RecentCall } from "@/lib/types";
import { OUTCOME_STYLES } from "@/lib/constants";
import { SentimentBadge } from "./SentimentBadge";

interface DataTableProps {
  columns: string[];
  data: RecentCall[];
}

export function DataTable({ columns, data }: DataTableProps) {
  if (!data.length) {
    return <EmptyTable columns={columns} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--card-shadow)]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="border-b border-border bg-surface px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text3"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const style = OUTCOME_STYLES[row.outcomeCls] ?? OUTCOME_STYLES.grey;
            return (
              <tr
                key={row.id}
                className="border-b border-border transition-colors last:border-b-0 hover:bg-blue/[0.04]"
              >
                <td className="px-4 py-3 font-mono text-xs text-text3">
                  {row.id}
                </td>
                <td className="px-4 py-3 text-[13px] text-text2">
                  {row.time}
                </td>
                <td className="px-4 py-3 text-[13px] text-text2">
                  {row.duration}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: style.bg, color: style.text }}
                  >
                    {row.outcome}
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px]">
                  <SentimentBadge sentCls={row.sentCls} />
                </td>
                <td className="max-w-[300px] px-4 py-3 text-xs text-text2">
                  {row.topic}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Empty state when no conversations exist */
function EmptyTable({ columns }: { columns: string[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--card-shadow)]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="border-b border-border bg-surface px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text3"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <div className="flex flex-col items-center justify-center py-16 text-text3">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-4 opacity-40"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="mt-1 text-xs opacity-60">
          Analysis data will appear here once the backend is connected
        </p>
      </div>
    </div>
  );
}

/** Skeleton placeholder for the table during loading */
export function DataTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--card-shadow)]">
      <div className="flex gap-4 border-b border-border bg-surface px-4 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
        >
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-48" />
        </div>
      ))}
    </div>
  );
}

import type { InsightItem } from "@/lib/types";

interface InsightsGridProps {
    insights: InsightItem[];
    accent: string;
}

export function InsightsGrid({ insights, accent }: InsightsGridProps) {
    if (!insights || insights.length === 0) {
        return null;
    }

    return (
        <section className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text3">
                ✦ Conversation Intelligence Insights
                <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-4 gap-3">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-border bg-card p-4 shadow-[var(--card-shadow)]"
                        style={{ borderLeftWidth: "3px", borderLeftColor: insight.badgeColor }}
                    >
                        <div className="mb-2 text-lg">{insight.icon}</div>
                        <div className="mb-2 text-[13px] font-bold leading-snug text-text1">
                            {insight.headline}
                        </div>
                        <div className="mb-3 text-[11px] leading-relaxed text-text2">
                            {insight.text}
                        </div>
                        <span
                            className="inline-block rounded-full px-2 py-1 text-[10px] font-semibold"
                            style={{
                                background: `${insight.badgeColor}18`,
                                color: insight.badgeColor,
                            }}
                        >
                            {insight.badge}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

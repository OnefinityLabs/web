import { SENTIMENT_CONFIG } from "@/lib/constants";

interface SentimentBadgeProps {
  sentCls: "pos" | "neg" | "neu";
}

export function SentimentBadge({ sentCls }: SentimentBadgeProps) {
  const config = SENTIMENT_CONFIG[sentCls];
  return (
    <span className={config.cls}>
      {config.emoji} {config.label}
    </span>
  );
}

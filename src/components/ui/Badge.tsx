import { type ReactNode } from "react";

type BadgeVariant =
  | "outbound"
  | "inbound"
  | "live"
  | "ready"
  | "processing"
  | "batches"
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "grey";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  outbound: "bg-blue/18 text-blue-l",
  inbound: "bg-purple/18 text-[#A78BFA]",
  live: "bg-green/18 text-[#34D399]",
  ready: "bg-green/18 text-[#34D399]",
  processing: "bg-amber/18 text-[#FCD34D]",
  batches: "bg-[rgba(6,182,212,0.15)] text-[#22D3EE]",
  blue: "bg-blue/18 text-[#60A5FA]",
  green: "bg-green/18 text-[#34D399]",
  red: "bg-red/18 text-[#FCA5A5]",
  amber: "bg-amber/18 text-[#FCD34D]",
  grey: "bg-[rgba(107,114,128,0.18)] text-[#9CA3AF]",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
  dotBefore?: boolean;
}

export function Badge({
  variant,
  children,
  className = "",
  dotBefore = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {dotBefore && <span className="text-[8px]">●</span>}
      {children}
    </span>
  );
}

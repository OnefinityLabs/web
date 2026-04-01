"use client";

import { useEffect } from "react";
import type { RecentCall } from "@/lib/types";

interface CallDetailPanelProps {
  call: RecentCall | null;
  onClose: () => void;
  accent: string;
}

const SENTIMENT_CONFIG: Record<string, { label: string; cls: string }> = {
  pos:      { label: "Positive", cls: "text-green" },
  neg:      { label: "Negative", cls: "text-red" },
  neu:      { label: "Neutral",  cls: "text-text3" },
  positive: { label: "Positive", cls: "text-green" },
  negative: { label: "Negative", cls: "text-red" },
  neutral:  { label: "Neutral",  cls: "text-text3" },
  mixed:    { label: "Mixed",    cls: "text-amber"  },
};

const OC_STYLE: Record<string, string> = {
  blue:  "rgba(37,99,235,.18)",
  green: "rgba(16,185,129,.18)",
  red:   "rgba(239,68,68,.18)",
  amber: "rgba(245,158,11,.18)",
  grey:  "rgba(107,114,128,.18)",
};
const OC_TEXT: Record<string, string> = {
  blue:  "#60A5FA",
  green: "#34D399",
  red:   "#FCA5A5",
  amber: "#FCD34D",
  grey:  "#9CA3AF",
};

export function CallDetailPanel({ call, onClose, accent }: CallDetailPanelProps) {
  const isOpen = call !== null;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!call) return null;

  const sentCfg   = SENTIMENT_CONFIG[call.sentCls] || SENTIMENT_CONFIG[call.sentiment?.toLowerCase() ?? "neu"] || { label: call.sentiment || "—", cls: "text-text3" };
  const ocBg      = OC_STYLE[call.outcomeCls ?? "grey"] ?? OC_STYLE.grey;
  const ocText    = OC_TEXT[call.outcomeCls  ?? "grey"] ?? OC_TEXT.grey;
  const hasAnalysis    = !!(call.summary || call.intent || call.emotion || call.agentPerf);
  const hasSignals     = call.isRepeatContact || call.fcrEligible !== null || call.callbackRequested || (call.escalationRisk ?? 0) > 0.5 || (call.flags ?? []).length > 0;
  const hasImprovements = (call.improvementSuggestions ?? []).length > 0;
  const hasFailures     = (call.failureReasons ?? []).length > 0;
  const hasTranscript   = Array.isArray(call.transcriptLabeled) && call.transcriptLabeled.length > 0;

  // Confidence meter helpers
  const conf     = call.analysisConfidence;
  const confPct  = conf != null ? Math.round(conf * 100) : null;
  const confColor = conf == null ? '#6B7280'
    : conf >= 0.75 ? '#10B981'   // green
    : conf >= 0.5  ? '#F59E0B'   // amber
    : '#EF4444';                 // red
  const confLabel = conf == null ? 'Not analysed'
    : conf >= 0.75 ? 'High confidence'
    : conf >= 0.5  ? 'Moderate confidence'
    : 'Low confidence';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[200] bg-black/40 transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none" }}
        onClick={onClose}
      />

      {/* Side Panel */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-[201] flex w-[480px] max-w-[96vw] flex-col border-l border-border bg-surface shadow-[-4px_0_24px_rgba(0,0,0,0.1)]"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 flex-col border-b border-border px-5 py-4 gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-bold text-text1">Call {call.id}</div>
              <div className="mt-0.5 text-[11px] text-text3">{call.time} · {call.duration}</div>
            </div>
            <button
              onClick={onClose}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-card text-[15px] text-text2 transition-colors hover:bg-border hover:text-text1"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Confidence bar */}
          {confPct !== null && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${confPct}%`, background: confColor }}
                />
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: confColor }}>
                {confPct}% · {confLabel}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

          {/* Metadata Grid */}
          <section>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text3">
              Call Metadata
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Time",      val: call.time },
                { label: "Duration",  val: call.duration },
                { label: "Direction", val: call.direction ?? "—" },
                { label: "Agent",     val: call.agentName ?? "—" },
                {
                  label: "Outcome",
                  val: (
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: ocBg, color: ocText }}
                    >
                      {call.outcome}
                    </span>
                  ),
                },
                {
                  label: "Sentiment",
                  val: <span className={sentCfg.cls}>{sentCfg.label}</span>,
                },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-lg bg-card px-3 py-2.5">
                  <div className="text-[13px] font-semibold text-text1">{val}</div>
                  <div className="mt-0.5 text-[10px] text-text3">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Conversation Transcript */}
          {hasTranscript && (
            <section>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text3">
                Conversation Transcript
              </div>
              <div className="flex flex-col gap-2.5">
                {call.transcriptLabeled!.map((turn, i) => {
                  const isAgent = turn.label === "Agent";
                  return (
                    <div
                      key={i}
                      className={`flex flex-col gap-1 ${isAgent ? "items-start" : "items-end"}`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text3 px-1">
                        {turn.label}
                      </span>
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                          isAgent
                            ? "rounded-tl-sm bg-card text-text1"
                            : "rounded-tr-sm text-white"
                        }`}
                        style={!isAgent ? { background: accent } : undefined}
                      >
                        {turn.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ConvIq Analysis */}
          {hasAnalysis && (
            <section>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text3">
                ConvIq Analysis
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-[12px]">
                {call.summary && (
                  <p className="mb-4 leading-relaxed text-text2">{call.summary}</p>
                )}
                <div className="space-y-2.5">
                  {call.intent && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-text3">Primary Intent</span>
                      <span className="max-w-[62%] text-right font-medium text-text1">{call.intent}</span>
                    </div>
                  )}
                  {call.emotion && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-text3">Customer Emotion</span>
                      <span className="max-w-[62%] text-right font-medium text-text1 capitalize">{call.emotion}</span>
                    </div>
                  )}
                  {call.agentPerf && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-text3">Agent Performance</span>
                      <span className="max-w-[62%] text-right font-medium capitalize" style={{ color: accent }}>{call.agentPerf}</span>
                    </div>
                  )}
                  {call.fcrEligible !== null && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-text3">FCR</span>
                      <span className={`max-w-[62%] text-right font-semibold ${call.fcrEligible ? "text-green" : "text-red"}`}>
                        {call.fcrEligible ? "✓ Resolved on first contact" : "✗ Not first-call resolved"}
                      </span>
                    </div>
                  )}
                </div>
                {call.topic && (
                  <div className="mt-3 rounded-r-md border-l-[3px] border-amber bg-surface py-2 pl-3 pr-2 text-[12px] italic leading-relaxed text-text2">
                    "{call.topic}"
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Signals */}
          {hasSignals && (
            <section>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text3">
                Signals Detected
              </div>
              <div className="flex flex-wrap gap-1.5">
                {call.isRepeatContact && (
                  <span className="rounded-xl border border-red/25 bg-red/14 px-2.5 py-1 text-[11px] font-medium text-red">
                    ↺ Repeat Contact
                  </span>
                )}
                {call.fcrEligible === true && (
                  <span className="rounded-xl border border-green/25 bg-green/14 px-2.5 py-1 text-[11px] font-medium text-green">
                    ✓ FCR — Resolved
                  </span>
                )}
                {call.fcrEligible === false && (
                  <span className="rounded-xl border border-red/25 bg-red/14 px-2.5 py-1 text-[11px] font-medium text-red">
                    ✗ FCR — Unresolved
                  </span>
                )}
                {call.callbackRequested && (
                  <span className="rounded-xl border border-amber/25 bg-amber/14 px-2.5 py-1 text-[11px] font-medium text-amber">
                    📞 Callback Requested
                  </span>
                )}
                {(call.escalationRisk ?? 0) > 0.5 && (
                  <span className="rounded-xl border border-red/25 bg-red/14 px-2.5 py-1 text-[11px] font-medium text-red">
                    ⚠ Escalation Risk {Math.round((call.escalationRisk ?? 0) * 100)}%
                  </span>
                )}
                {call.sentCls === "pos" && (
                  <span className="rounded-xl border border-green/25 bg-green/14 px-2.5 py-1 text-[11px] font-medium text-green">
                    ✓ Positive Sentiment
                  </span>
                )}
                {call.sentCls === "neg" && (
                  <span className="rounded-xl border border-red/25 bg-red/14 px-2.5 py-1 text-[11px] font-medium text-red">
                    ✗ Negative Sentiment
                  </span>
                )}
                {(call.flags ?? []).map((flag, i) => (
                  <span key={i} className="rounded-xl border border-blue/25 bg-blue/10 px-2.5 py-1 text-[11px] font-medium text-blue-l">
                    {flag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Failure Reasons */}
          {hasFailures && (
            <section>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text3">
                Failure Reasons
              </div>
              <div className="space-y-2">
                {call.failureReasons!.map((fr, i) => (
                  <div key={i} className="rounded-lg border border-red/20 bg-card px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold capitalize text-text1">
                        {fr.category?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-red">
                        {Math.round((fr.confidence ?? 0) * 100)}% confidence
                      </span>
                    </div>
                    {fr.explanation && (
                      <p className="mt-1 text-[11px] leading-relaxed text-text2">{fr.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Improvement Suggestions */}
          {hasImprovements && (
            <section>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text3">
                Improvement Suggestions
              </div>
              <ul className="space-y-2">
                {call.improvementSuggestions!.map((suggestion, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-[12px] leading-relaxed text-text2"
                  >
                    <span style={{ color: accent }} className="mt-px flex-shrink-0 font-bold">
                      {i + 1}.
                    </span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Footer — no analysis fallback */}
          {!hasAnalysis && !hasSignals && !hasImprovements && !hasFailures && !hasTranscript && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
              <div className="text-2xl">⏳</div>
              <div className="text-[13px] font-medium text-text2">Analysis Pending</div>
              <div className="text-[11px] text-text3">
                This call is queued for transcription and AI analysis
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

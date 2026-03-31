"use client";

import type { ImportFormData } from "@/lib/types";
import { StepIndicator } from "./StepIndicator";

interface ImportStep3Props {
    formData: ImportFormData;
    onStart: () => void;
    onBack: () => void;
}

export function ImportStep3({ formData, onStart, onBack }: ImportStep3Props) {
    // Calculate ETA (rough estimate: 1 minute per 10 records)
    const recordCount = formData.recordCount || 0;
    const etaMinutes = Math.ceil(recordCount / 10);
    const hours = Math.floor(etaMinutes / 60);
    const minutes = etaMinutes % 60;
    const etaDisplay = hours > 0 ? `~${hours}h ${minutes}m` : `~${minutes}m`;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[22px] font-bold text-text1">Review & Start Analysis</h1>
                <p className="mt-1.5 text-[13px] leading-relaxed text-text2">
                    Confirm your import details and start the conversation intelligence analysis.
                </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={3} />

            {/* ETA Card */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--card-shadow)]">
                <div className="mb-3 text-[36px]">⏳</div>
                <div className="text-[38px] font-extrabold tracking-tight text-amber">
                    {etaDisplay}
                </div>
                <div className="mt-1 text-[13px] text-text2">
                    Estimated processing time
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-surface p-3">
                        <div className="text-base font-bold text-text1">
                            {recordCount.toLocaleString()}
                        </div>
                        <div className="mt-0.5 text-[10px] text-text3">Total Records</div>
                    </div>
                    <div className="rounded-lg bg-surface p-3">
                        <div className="text-base font-bold text-text1">{formData.source}</div>
                        <div className="mt-0.5 text-[10px] text-text3">Data Source</div>
                    </div>
                    <div className="rounded-lg bg-surface p-3">
                        <div className="text-base font-bold text-text1">
                            {new Date(formData.dateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(formData.dateTo).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="mt-0.5 text-[10px] text-text3">Date Range</div>
                    </div>
                </div>
            </div>

            {/* Process Info */}
            <div className="mb-6 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-text2 shadow-[var(--card-shadow)]">
                <p>
                    <strong className="text-text1">What happens next:</strong> ConvIq will
                    transcribe, analyze sentiment, extract topics, and generate insights from
                    your call recordings. You'll receive a notification when analysis is
                    complete. The project will appear in your dashboard with a processing
                    indicator.
                </p>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-3">
                <button
                    onClick={onBack}
                    className="rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-text2 transition-colors hover:border-border2 hover:text-text1"
                >
                    ← Back
                </button>
                <button
                    onClick={onStart}
                    className="flex-1 rounded-lg bg-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-l"
                >
                    Start Analysis →
                </button>
            </div>
        </div>
    );
}

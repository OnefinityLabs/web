"use client";

import { useState } from "react";
import type { ImportFormData, ImportSource } from "@/lib/types";
import { StepIndicator } from "./StepIndicator";
import { SourceSelector } from "./SourceSelector";

interface ImportStep1Props {
    formData: ImportFormData;
    onComplete: (data: Partial<ImportFormData>) => void;
    onCancel: () => void;
    showBatchLabel?: boolean;
}

export function ImportStep1({ formData, onComplete, onCancel, showBatchLabel = false }: ImportStep1Props) {
    const [source, setSource] = useState<ImportSource>(formData.source);
    const [projectName, setProjectName] = useState(formData.projectName);
    const [batchLabel, setBatchLabel] = useState(formData.batchLabel || "");
    const [dateFrom, setDateFrom] = useState(formData.dateFrom);
    const [dateTo, setDateTo] = useState(formData.dateTo);

    const handleContinue = () => {
        if (!projectName || !dateFrom || !dateTo) {
            alert("Please fill in all fields");
            return;
        }

        onComplete({ source, projectName, batchLabel, dateFrom, dateTo });
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[22px] font-bold text-text1">Import Call Records</h1>
                <p className="mt-1.5 text-[13px] leading-relaxed text-text2">
                    Bring conversation intelligence to your existing dialer data. ConvIq analyses
                    your records asynchronously and surfaces insights without interrupting live operations.
                </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={1} />

            {/* Data Source */}
            <div className="mb-6">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-text3">
                    Data Source
                </label>
                <SourceSelector selected={source} onSelect={setSource} />
            </div>

            {/* Project Name */}
            <div className="mb-6">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-text3">
                    Project Name
                </label>
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Collections Support — Q1 2026"
                    className="w-full rounded-lg border border-border2 bg-surface px-4 py-3 text-sm text-text1 transition-colors focus:border-blue focus:outline-none"
                />
            </div>

            {/* Batch Label — only shown when uploading a batch inside an existing project */}
            {showBatchLabel && (
                <div className="mb-6">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-text3">
                        Batch Label <span className="font-normal normal-case tracking-normal text-text3/60">(optional — e.g. "March 2026 Upload")</span>
                    </label>
                    <input
                        type="text"
                        value={batchLabel}
                        onChange={(e) => setBatchLabel(e.target.value)}
                        placeholder="e.g. Batch 1: March 2026"
                        className="w-full rounded-lg border border-border2 bg-surface px-4 py-3 text-sm text-text1 transition-colors focus:border-blue focus:outline-none"
                    />
                </div>
            )}

            {/* Call Date Range */}
            <div className="mb-6">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-text3">
                    Call Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="rounded-lg border border-border2 bg-surface px-4 py-3 text-sm text-text1 transition-colors focus:border-blue focus:outline-none"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="rounded-lg border border-border2 bg-surface px-4 py-3 text-sm text-text1 transition-colors focus:border-blue focus:outline-none"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-3">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-text2 transition-colors hover:border-border2 hover:text-text1"
                >
                    Cancel
                </button>
                <button
                    onClick={handleContinue}
                    className="flex-1 rounded-lg bg-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-l"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}

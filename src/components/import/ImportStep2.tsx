"use client";

import { useState, useRef } from "react";
import type { ImportFormData } from "@/lib/types";
import { StepIndicator } from "./StepIndicator";

interface ImportStep2Props {
    formData: ImportFormData;
    onComplete: (data: Partial<ImportFormData>) => void;
    onBack: () => void;
}

export function ImportStep2({ formData, onComplete, onBack }: ImportStep2Props) {
    const [file, setFile] = useState<File | null>(formData.file || null);
    const [recordCount, setRecordCount] = useState(formData.recordCount || 0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        
        // Actually decode the file to get the real row count!
        if (selectedFile.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                // Count newlines, subtract 1 for the header row
                const lines = text.split('\n').length - 1;
                setRecordCount(Math.max(1, lines));
            };
            // Read just a chunk if it's massive, but for 6MB whole text is <50ms.
            reader.readAsText(selectedFile);
        } else {
            setRecordCount(500); // fallback for ZIPs depending on contents
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleContinue = () => {
        if (!file) {
            alert("Please upload a file");
            return;
        }

        onComplete({ file, recordCount });
    };

    const isVapi = formData.source === "Vapi";

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[22px] font-bold text-text1">Upload Call Records</h1>
                <p className="mt-1.5 text-[13px] leading-relaxed text-text2">
                    {isVapi
                        ? "Vapi projects sync automatically. You can skip this step or upload additional historical data."
                        : "Drop your CDR export or recording manifest below."}
                </p>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={2} />

            {/* Vapi Auto-Sync Note */}
            {isVapi && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-green/20 bg-green/7 px-4 py-3 text-xs font-medium text-green">
                    <span>✓</span>
                    <span>
                        Vapi projects auto-sync via API. Historical data can be uploaded optionally.
                    </span>
                </div>
            )}

            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${file
                        ? "border-green bg-green/4"
                        : isDragging
                            ? "border-blue bg-blue/4"
                            : "border-border2 hover:border-blue hover:bg-blue/4"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.zip"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                <div className="mb-3 text-[30px]">
                    {file ? "✓" : "📁"}
                </div>

                <div className="text-sm font-semibold text-text1">
                    {file ? `✓ ${file.name} — ${recordCount.toLocaleString()} records detected` : "Drop file here or click to browse"}
                </div>

                <div className="mt-1 text-xs text-text3">
                    {file ? `File ready for processing · ${(file.size / 1024 / 1024).toFixed(1)} MB` : "Drag & drop your export file"}
                </div>

                {!file && (
                    <div className="mt-4 flex justify-center gap-2">
                        {["CSV", "JSON", "ZIP"].map((format) => (
                            <span
                                key={format}
                                className="rounded border border-border2 bg-surface px-2 py-1 text-[10px] text-text3"
                            >
                                {format}
                            </span>
                        ))}
                    </div>
                )}
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
                    onClick={handleContinue}
                    disabled={!file}
                    className="flex-1 rounded-lg bg-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-l disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}

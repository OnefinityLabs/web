"use client";

import { useState, useEffect } from "react";
import { ImportStep1 } from "@/components/import/ImportStep1";
import { ImportStep2 } from "@/components/import/ImportStep2";
import { ImportStep3 } from "@/components/import/ImportStep3";
import { uploadBatch, processBatch } from "@/lib/api";
import type { ImportFormData } from "@/lib/types";

type ModalPhase = "wizard" | "uploading" | "success";

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated?: () => void;
  onStatusChange?: (status: string | null) => void;
  agentName?: string;
  projectId?: number | null;
}

export function BatchImportModal({
  isOpen,
  onClose,
  onBatchCreated,
  onStatusChange,
  agentName,
  projectId,
}: BatchImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [phase, setPhase] = useState<ModalPhase>("wizard");
  const [formData, setFormData] = useState<ImportFormData>({
    source: "Genesys",
    projectName: agentName || "",
    batchLabel: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setPhase("wizard");
      setFormData({
        source: "Genesys",
        projectName: agentName || "",
        batchLabel: "",
        dateFrom: "",
        dateTo: "",
      });
    }
  }, [isOpen, agentName]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStep1Complete = (data: Partial<ImportFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: Partial<ImportFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStartProcessing = async () => {
    if (!formData.file || !projectId) {
      if (!projectId) alert("Project not found. Cannot upload batch.");
      return;
    }

    setPhase("uploading");

    const dateLabel = formData.dateFrom && formData.dateTo
      ? `${new Date(formData.dateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(formData.dateTo).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const batchLabel = formData.batchLabel
      || `${formData.projectName || agentName || "Upload"}: ${dateLabel}`;

    const savedFile = formData.file;
    const savedSource = formData.source;

    // Show success message after 2s then close
    setTimeout(() => {
      setPhase("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 2000);

    // Upload in background — don't block the modal
    try {
      const uploadResult = await uploadBatch(projectId, savedFile, batchLabel, savedSource);

      if (uploadResult.success && uploadResult.data) {
        const { batch_id, queued } = uploadResult.data;
        onStatusChange?.(`Batch "${batchLabel}" ingested — ${queued} calls queued for analysis`);

        if (queued > 0) {
          processBatch(projectId, batch_id).then(() => {
            onStatusChange?.(null);
          });
        } else {
          setTimeout(() => onStatusChange?.(null), 5000);
        }

        onBatchCreated?.();
      } else {
        onStatusChange?.(`Upload failed: ${uploadResult.error?.message || "Unknown error"}`);
        setTimeout(() => onStatusChange?.(null), 6000);
      }
    } catch (err) {
      console.error("Batch upload error:", err);
      onStatusChange?.("An error occurred while uploading the batch.");
      setTimeout(() => onStatusChange?.(null), 6000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        onClick={phase === "wizard" ? onClose : undefined}
      />

      <div className="fixed inset-0 z-[201] flex items-start justify-center overflow-y-auto px-4 py-12">
        <div
          className="relative w-full max-w-3xl rounded-2xl border border-border bg-bg p-8 shadow-[0_25px_60px_rgba(0,0,0,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {phase === "wizard" && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg text-text3 transition-colors hover:bg-surface hover:text-text1"
              aria-label="Close import dialog"
            >
              ✕
            </button>
          )}

          {/* Uploading phase */}
          {phase === "uploading" && (
            <div className="flex flex-col items-center py-16">
              <div className="mb-5 h-10 w-10 animate-spin rounded-full border-4 border-blue border-t-transparent" />
              <div className="text-base font-semibold text-text1">
                Uploading & Ingesting CSV...
              </div>
              <div className="mt-1.5 text-[13px] text-text3">
                Parsing call records and computing quality gate
              </div>
            </div>
          )}

          {/* Success phase */}
          {phase === "success" && (
            <div className="flex flex-col items-center py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green/15 text-2xl">
                ✓
              </div>
              <div className="text-base font-semibold text-text1">
                Batch ingested successfully
              </div>
              <div className="mt-1.5 text-[13px] text-text3">
                Redirecting back to dashboard...
              </div>
            </div>
          )}

          {/* Wizard steps */}
          {phase === "wizard" && (
            <>
              {currentStep === 1 && (
                <ImportStep1
                  formData={formData}
                  onComplete={handleStep1Complete}
                  onCancel={onClose}
                  showBatchLabel
                />
              )}

              {currentStep === 2 && (
                <ImportStep2
                  formData={formData}
                  onComplete={handleStep2Complete}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <ImportStep3
                  formData={formData}
                  onStart={handleStartProcessing}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { ImportStep1 } from "@/components/import/ImportStep1";
import { ImportStep2 } from "@/components/import/ImportStep2";
import { ImportStep3 } from "@/components/import/ImportStep3";
import type { ImportFormData } from "@/lib/types";
import { createProject, uploadBatch, processBatch } from "@/lib/api";

/**
 * Import Records Page
 * 
 * 3-step wizard for importing call records from various sources
 */
export default function ImportPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ImportFormData>({
        source: "Genesys",
        projectName: "",
        batchLabel: "",
        dateFrom: "",
        dateTo: "",
    });

    const handleStep1Complete = (data: Partial<ImportFormData>) => {
        setFormData({ ...formData, ...data });
        setCurrentStep(2);
    };

    const handleStep2Complete = (data: Partial<ImportFormData>) => {
        setFormData({ ...formData, ...data });
        setCurrentStep(3);
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleStartProcessing = async () => {
        if (!formData.file) {
            alert("No file selected for processing.");
            return;
        }

        setIsUploading(true);
        try {
            const projectName = formData.projectName || "Untitled Project";
            const agentKey = projectName.toLowerCase().includes("lead") ? "lead-gen" : "inbound-support";
            const tenantConfigKey = "green-fortune";

            // 1. Create project in DB
            console.log("Creating project...");
            const projRes = await createProject({
                name: projectName,
                project_type_id: 1,
                tenant_id: 1,
                tenant_config_key: tenantConfigKey,
                project_key: agentKey,
                call_types: agentKey === "lead-gen" ? "outbound" : "inbound",
            });

            if (!projRes.success || !projRes.data) {
                alert("Failed to create project: " + projRes.error?.message);
                return;
            }

            const projectId = projRes.data.id;
            console.log("Project created:", projectId);

            // 2. Upload CSV as a batch
            console.log("Uploading CSV as batch...");
            const batchLabel = formData.batchLabel || `${projectName}: ${new Date().toLocaleDateString()}`;
            const uploadRes = await uploadBatch(projectId, formData.file, batchLabel, formData.source);
            console.log("Upload result:", uploadRes);

            if (uploadRes.success && uploadRes.data) {
                // 3. Start processing the batch
                console.log("Starting batch processing...");
                await processBatch(projectId, uploadRes.data.batch_id);

                // Redirect to the new project dashboard
                router.push(`/agent/${projectId}`);
            } else {
                alert("Upload failed: " + uploadRes.error?.message);
            }
        } catch (error) {
            console.error("Processing error:", error);
            alert("An error occurred while starting analysis.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCancel = () => {
        router.push("/");
    };

    return (
        <div className="flex min-h-screen flex-col bg-bg">
            <TopNav
                title="Import Records"
                showBackButton
                onBack={handleCancel}
            />

            <main className="flex-1 px-8 py-10">
                <div className="mx-auto w-full max-w-3xl">
                    {currentStep === 1 && (
                        <ImportStep1
                            formData={formData}
                            onComplete={handleStep1Complete}
                            onCancel={handleCancel}
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
                        <div className="relative">
                            {isUploading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/80 backdrop-blur-sm">
                                    <div className="flex flex-col items-center">
                                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue border-t-transparent"></div>
                                        <div className="text-sm font-semibold text-text1">Uploading & Parsing CSV...</div>
                                        <div className="mt-1 text-xs text-text3">This may take a moment depending on file size</div>
                                    </div>
                                </div>
                            )}
                            <ImportStep3
                                formData={formData}
                                onStart={handleStartProcessing}
                                onBack={handleBack}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

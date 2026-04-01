"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { ImportStep1 } from "@/components/import/ImportStep1";
import { ImportStep2 } from "@/components/import/ImportStep2";
import { ImportStep3 } from "@/components/import/ImportStep3";
import type { ImportFormData } from "@/lib/types";
import { uploadCSV, startProcessing } from "@/lib/api";

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
            // Determine agent key from project name or default to inbound-support
            const agentKey = formData.projectName.toLowerCase().includes("lead") ? "lead-gen" : "inbound-support";
            
            // 1. Upload CSV
            console.log("Uploading CSV to backend...");
            const uploadRes = await uploadCSV(agentKey, formData.file);
            console.log("Upload result:", uploadRes);
            
            if (uploadRes.success) {
                // 2. Start Processing
                console.log("Starting backend processing pipeline...");
                await startProcessing(agentKey);
                
                // Redirect to home where processing project will be shown
                router.push("/");
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

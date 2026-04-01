interface StepIndicatorProps {
    currentStep: 1 | 2 | 3;
}

const steps = [
    { num: 1, label: "Source & Project" },
    { num: 2, label: "Upload Records" },
    { num: 3, label: "Review & Start" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="mb-10 flex items-center">
            {steps.map((step, idx) => (
                <div key={step.num} className="flex items-center">
                    {/* Step Circle */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${step.num < currentStep
                                    ? "border-green bg-green text-white"
                                    : step.num === currentStep
                                        ? "border-blue bg-blue/10 text-blue"
                                        : "border-border2 text-text3"
                                }`}
                        >
                            {step.num < currentStep ? "✓" : step.num}
                        </div>
                        <span
                            className={`whitespace-nowrap text-xs font-medium ${step.num === currentStep ? "text-text1" : "text-text3"
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* Connector Line */}
                    {idx < steps.length - 1 && (
                        <div className="mx-3 h-px min-w-[32px] flex-1 bg-border" />
                    )}
                </div>
            ))}
        </div>
    );
}

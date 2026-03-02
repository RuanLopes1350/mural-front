import React from "react";

interface Step {
  number: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step.number < currentStep
                    ? "bg-[#805AD5] border-[#805AD5] text-white"
                    : step.number === currentStep
                    ? "bg-white border-[#805AD5] text-[#805AD5] ring-4 ring-[#E9D8FD]"
                    : "bg-white border-[#CBD5E0] text-[#A0AEC0]"
                }`}
              >
                {step.number < currentStep ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-lg font-bold">{step.number}</span>
                )}
              </div>
              
              {/* Step Info */}
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    step.number <= currentStep
                      ? "text-[#2D3748]"
                      : "text-[#A0AEC0]"
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p
                    className={`text-xs mt-1 transition-colors ${
                      step.number <= currentStep
                        ? "text-[#718096]"
                        : "text-[#CBD5E0]"
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 -mt-12">
                <div
                  className={`h-full transition-all duration-300 ${
                    step.number < currentStep
                      ? "bg-[#805AD5]"
                      : "bg-[#E2E8F0]"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

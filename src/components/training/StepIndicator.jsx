import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500",
                  isCompleted && "bg-emerald-500 text-white",
                  isActive && "bg-white text-slate-900",
                  !isActive && !isCompleted && "bg-white/5 text-slate-600 border border-white/10"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block transition-colors duration-300",
                  isActive ? "text-white" : "text-slate-600"
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 max-w-[40px] transition-colors duration-500",
                  i < currentStep ? "bg-emerald-500" : "bg-white/10"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
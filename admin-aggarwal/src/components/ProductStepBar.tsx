"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const PRODUCT_FORM_STEPS = [
  { id: "basic", label: "Basic info" },
  { id: "image", label: "Image" },
  { id: "variants", label: "Pricing" },
  { id: "tags", label: "Badges" },
  { id: "seo", label: "SEO" },
] as const;

export type ProductFormStepId = (typeof PRODUCT_FORM_STEPS)[number]["id"];

interface ProductStepBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function ProductStepBar({ currentStep, onStepClick }: ProductStepBarProps) {
  return (
    <nav aria-label="Product form steps" className="admin-step-bar">
      {PRODUCT_FORM_STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick(index)}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "admin-step-card",
              isActive && "admin-step-card-active",
              isComplete && "admin-step-card-complete",
            )}
          >
            <span
              className={cn(
                "admin-step-card-index",
                isActive && "admin-step-card-index-active",
                isComplete && "admin-step-card-index-complete",
              )}
            >
              {isComplete ? <Check size={14} strokeWidth={2.5} /> : index + 1}
            </span>
            <span className="admin-step-card-label">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

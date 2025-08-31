"use client"
import {Progress} from "@heroui/react";
import React from "react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({currentStep, totalSteps}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex w-full flex-col gap-2">
      <Progress aria-label="Form progress" className="max-w-md" color="primary" value={progress} />
      <p className="text-small text-default-500">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

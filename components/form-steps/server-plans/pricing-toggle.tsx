import React from "react";
import { Switch } from "@heroui/react";

interface PricingToggleProps {
  isYearly: boolean;
  onChange: (checked: boolean) => void;
}

export function PricingToggle({ isYearly, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span className={`text-sm ${!isYearly ? "font-medium" : ""}`}>Monthly</span>
      <Switch 
        isSelected={isYearly}
        onValueChange={onChange}
        size="lg"
      />
      <span className={`text-sm ${isYearly ? "font-medium" : ""}`}>
        Yearly <span className="text-success">(-20%)</span>
      </span>
    </div>
  );
}
import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface PricingPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  isPopular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
}

export function PricingCard({ plan, isYearly }: PricingCardProps) {
  const price = isYearly ? plan.price.yearly : plan.price.monthly;
  
  return (
    <div className="relative">
      {plan.isPopular && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 px-4 py-1.5 
                      text-xs font-medium bg-primary text-white rounded-full z-10">
          Most Popular
        </div>
      )}
      <Card 
        className={`w-full ${plan.isPopular ? "border-2 border-primary" : ""}`}
        shadow="md"
      >
        <CardHeader className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-default-500 text-sm">{plan.description}</p>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-small text-default-500">/{isYearly ? "year" : "month"}</span>
          </div>
        </CardHeader>
        <CardBody className="gap-6">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Icon icon="lucide:check" className="text-success" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            color={plan.isPopular ? "primary" : "default"}
            variant={plan.isPopular ? "solid" : "bordered"}
            className="w-full"
          >
            Get Started
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
import React from "react";
import { PricingToggle } from "./pricing-toggle";
import { PricingCard } from "./server-plans";

const pricingPlans = [
  {
    description: "Perfect for side projects and simple applications",
    features: ["Up to 3 projects", "Basic analytics", "Community support", "1GB storage"],
    name: "Free",
    price: {monthly: 0, yearly: 0},
  },
  {
    description: "Ideal for growing businesses and teams",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "10GB storage",
      "Team collaboration",
    ],
    isPopular: true,
    name: "Pro",
    price: {monthly: 29, yearly: 279},
  },
  {
    description: "For large organizations with custom needs",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "24/7 phone support",
      "Unlimited storage",
      "SLA guarantee",
    ],
    name: "Enterprise",
    price: {monthly: 99, yearly: 949},
  },
];

export default function ServerPlans() {
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <div className="bg-default-50 min-h-screen px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-large text-default-500">
            Choose the perfect plan for your needs. No hidden fees.
          </p>
        </div>

        {/* Pricing Toggle */}
        <PricingToggle isYearly={isYearly} onChange={setIsYearly} />

        {/* Pricing Cards */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} isYearly={isYearly} />
          ))}
        </div>
      </div>
    </div>
  );
}

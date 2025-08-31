"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown, Rocket } from "lucide-react";
import { useState } from "react";
import { BorderBeam } from "@/components/magicui/border-beam";

const plans = [
  {
    id: "starter-plan",
    name: "Starter",
    monthlyPrice: 9.0,
    annualPrice: 90.0,
    description: "Perfect for individuals getting started",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Up to 5 projects",
      "10GB storage",
      "Basic analytics",
      "Email support",
      "Standard templates",
    ],
    popular: false,
    buttonText: "Down Create",
    trialDays: 14,
  },
  {
    id: "professional-plan",
    name: "Professional",
    monthlyPrice: 29.0,
    annualPrice: 290.0,
    description: "Ideal for growing teams and businesses",
    icon: <Star className="h-6 w-6" />,
    features: [
      "Up to 25 projects",
      "100GB storage",
      "Advanced analytics",
      "Priority support",
      "Premium templates",
      "Team collaboration",
      "Custom integrations",
    ],
    popular: true,
    buttonText: "Current",
    trialDays: 30,
  },
  {
    id: "business-plan",
    name: "Business",
    monthlyPrice: 79.0,
    annualPrice: 790.0,
    description: "Advanced features for established companies",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Unlimited projects",
      "500GB storage",
      "Real-time analytics",
      "24/7 phone support",
      "White-label options",
      "Advanced security",
      "API access",
      "Custom workflows",
    ],
    popular: false,
    buttonText: "Upgrade Now",
    trialDays: 30,
  },
  {
    id: "enterprise-plan",
    name: "Enterprise",
    monthlyPrice: 199.0,
    annualPrice: 1990.0,
    description: "Complete solution for large organizations",
    icon: <Rocket className="h-6 w-6" />,
    features: [
      "Unlimited everything",
      "Unlimited storage",
      "Custom analytics",
      "Dedicated support",
      "Full customization",
      "Enterprise security",
      "SLA guarantee",
      "On-premise option",
      "Training & onboarding",
    ],
    popular: false,
    buttonText: "Upgrade Now",
    trialDays: 30,
  },
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-space-grotesk text-4xl md:text-6xl font-bold text-foreground mb-6">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Unlock powerful features and take your productivity to the next level
          with our flexible subscription options
        </p>

        {/* Added billing cycle toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-primary" />
          <span>30-day money-back guarantee</span>
          <Check className="h-4 w-4 text-primary ml-4" />
          <span>Cancel anytime</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const selectedPrice =
              billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const displayPrice =
              billingCycle === "monthly"
                ? `$${plan.monthlyPrice}`
                : `$${Math.round(plan.annualPrice / 12)}`;
            const period = billingCycle === "monthly" ? "/month" : "/month";
            const savings =
              billingCycle === "annual"
                ? Math.round(
                    ((plan.monthlyPrice * 12 - plan.annualPrice) /
                      (plan.monthlyPrice * 12)) *
                      100
                  )
                : 0;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        plan.popular
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="font-space-grotesk text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {displayPrice}
                    </span>
                    <span className="text-muted-foreground">{period}</span>
                  </div>
                  {billingCycle === "annual" && savings > 0 && (
                    <p className="text-sm text-primary font-medium">
                      Save {savings}% annually
                    </p>
                  )}
                  {plan.trialDays > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {plan.trialDays}-day free trial
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    className={`w-full cursor-pointer ${
                      plan.popular
                        ? "bg-gray-300 hover:bg-gray-200 text-secondary-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                    size="lg"
                    data-plan-id={plan.id}
                    data-billing-cycle={billingCycle}
                    data-selected-price={selectedPrice}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
                {!plan.popular && (
                  <>
                    <BorderBeam
                      duration={6}
                      size={400}
                      className="from-transparent via-red-500 to-transparent"
                    />
                    <BorderBeam
                      duration={6}
                      delay={3}
                      size={400}
                      borderWidth={2}
                      className="from-transparent via-blue-500 to-transparent"
                    />
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-space-grotesk text-3xl font-bold text-foreground mb-8">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-space-grotesk text-xl font-semibold">
                Lightning Fast
              </h3>
              <p className="text-muted-foreground">
                Experience blazing-fast performance with our optimized
                infrastructure
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-space-grotesk text-xl font-semibold">
                Premium Quality
              </h3>
              <p className="text-muted-foreground">
                Built with attention to detail and industry best practices
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-space-grotesk text-xl font-semibold">
                Enterprise Ready
              </h3>
              <p className="text-muted-foreground">
                Scalable solutions that grow with your business needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Questions about our plans? We're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="#"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

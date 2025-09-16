"use client";
import { Button } from "@/components/ui/button";
import {
  Star,
  Zap,
  Crown,
  Rocket,
  Loader2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define a type for a single currency
type CurrencyData = {
  symbol: string;
  rate: number;
  name: string;
};

// Define a type for the currency rates object
type CurrencyRates = {
  [key: string]: CurrencyData;
  usd: CurrencyData;
  eur: CurrencyData;
  gbp: CurrencyData;
  cad: CurrencyData;
  aud: CurrencyData;
  jpy: CurrencyData;
  dkk: CurrencyData;
  sek: CurrencyData;
  nok: CurrencyData;
};

// Define types based on Supabase schema
type Product = {
  product_id: string;
  product_name: string;
  is_active: boolean;
  plan_name: string;
  max_users: number;
  features_ids: string[];
  monthly_price: number;
  annual_price: number;
  currency: string;
  billing_cycle: "monthly" | "annual" | "both";
  off_on_annual: number;
};

// Define feature type
type Feature = {
  id: string;
  feature_name: string;
  feature_settings?: any;
  is_active: boolean;
};

// Define feature mapping type
type FeatureMapping = {
  [key: string]: {
    name: string;
    description?: string;
  };
};

// Payment form type
type PaymentForm = {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
};

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
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  );
  const [currency, setCurrency] = useState<keyof CurrencyRates>("usd");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureMapping, setFeatureMapping] = useState<FeatureMapping>({});
  const [loading, setLoading] = useState(true);

  // New states for upgrade functionality
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  useEffect(() => {
    // Check for current plan in local storage on component mount
    const savedPlan = localStorage.getItem("currentPlan");
    if (savedPlan) {
      setCurrentPlan(savedPlan);
    }

    async function fetchData() {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .schema("shared")
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("monthly_price");

        if (productsError) {
          throw productsError;
        }

        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .schema("shared")
          .from("features")
          .select("*")
          .eq("is_active", true);

        if (featuresError) {
          throw featuresError;
        }

        setProducts(productsData || []);
        setFeatures(featuresData || []);

        // Create feature mapping object
        const mapping: FeatureMapping = {};
        if (featuresData) {
          featuresData.forEach((feature: Feature) => {
            mapping[feature.id] = {
              name: feature.feature_name,
              description: feature.feature_settings?.description || undefined,
            };
          });
        }
        setFeatureMapping(mapping);

        // Fetch current user plan
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: subscriptionData } = await supabase
            .from("subscriptions")
            .select("product_id")
            .eq("user_id", user.id)
            .single();

          if (subscriptionData) {
            setCurrentPlan(subscriptionData.product_id);
            // Save current plan to local storage
            localStorage.setItem("currentPlan", subscriptionData.product_id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const currencyRates: CurrencyRates = {
    usd: { symbol: "$", rate: 1, name: "USD" },
    eur: { symbol: "€", rate: 0.85, name: "EUR" },
    gbp: { symbol: "£", rate: 0.73, name: "GBP" },
    cad: { symbol: "C$", rate: 1.25, name: "CAD" },
    aud: { symbol: "A$", rate: 1.35, name: "AUD" },
    jpy: { symbol: "¥", rate: 110, name: "JPY" },
    dkk: { symbol: "kr", rate: 6.0, name: "DKK" },
    sek: { symbol: "kr", rate: 8.5, name: "SEK" },
    nok: { symbol: "kr", rate: 8.2, name: "NOK" },
  };

  const convertPrice = (usdPrice: number): number => {
    const rate = currencyRates[currency].rate;
    const converted = usdPrice * rate;

    if (currency === "jpy") {
      return Math.round(converted);
    }

    return Math.round(converted * 100) / 100;
  };

  const formatPrice = (price: number): string => {
    const symbol = currencyRates[currency].symbol;
    const converted = convertPrice(price);

    if (currency === "jpy") {
      return `${symbol}${converted.toLocaleString()}`;
    }

    return `${symbol}${converted}`;
  };

  // Handle upgrade button click
  const handleUpgradeClick = (product: Product) => {
    setSelectedPlan(product);
    setIsUpgradeDialogOpen(true);
  };

  // Handle payment form input changes
  const handlePaymentFormChange = (field: keyof PaymentForm, value: string) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!selectedPlan) return;

    setIsProcessingPayment(true);

    try {
      // Validate form
      const requiredFields: (keyof PaymentForm)[] = [
        "cardNumber",
        "cardName",
        "expiryDate",
        "cvv",
        "address",
        "city",
        "country",
        "postalCode",
      ];

      for (const field of requiredFields) {
        if (!paymentForm[field].trim()) {
          alert(
            `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
          );
          setIsProcessingPayment(false);
          return;
        }
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // Update current plan state
      setCurrentPlan(selectedPlan.product_id);

      // Save current plan to local storage
      localStorage.setItem("currentPlan", selectedPlan.product_id);

      // Close dialog and reset form
      setIsUpgradeDialogOpen(false);
      setPaymentForm({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
      });

      alert("Payment successful! Your plan has been upgraded.");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Tooltip state and handlers
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    featureId: string
  ) => {
    const feature = featureMapping[featureId];
    if (feature && feature.description) {
      setTooltip({
        visible: true,
        content: feature.description,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

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
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6 gap-6 max-w-6xl mx-auto">
          <div>
            {/* Save 20% Badge with SVG */}
            <div className="flex items-center gap-3 mb-6">
              <svg
                className="shrink-0 -mb-4 -mr-4"
                height="33"
                viewBox="0 0 54 54"
                width="42"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.7 1.2C16 21 21.3 39.3 34.2 43.4"
                  fill="none"
                  stroke="#25221E"
                  strokeLinecap="round"
                  strokeOpacity="0.5"
                  strokeWidth="2"
                />
                <path
                  d="m36.3 38.8-.2.6c0 .2.1.5.4.8.4.8.8 1.7 1 2.6.4 1 .6 2 .7 2.8v1.8l-2 .1a18 18 0 0 1-4.8-.8 3 3 0 0 0-.8-.2c-.2 0-.4.1-.5.3a1 1 0 0 0-.3.7c0 .3.1.5.4.7l.3.2.7.3a17 17 0 0 0 3.6.6 30 30 0 0 0 4 0h.6a1.5 1.5 0 0 0 .5-.6l.2-.6a13.3 13.3 0 0 0-.1-4 17 17 0 0 0-1.9-5c0-.2-.2-.3-.3-.4a1 1 0 0 0-.7-.3c-.3 0-.5.1-.8.4"
                  fill="#25221E"
                  fillOpacity="0.5"
                />
              </svg>
              <p className="text-lg italic text-gray-600">Save 20%</p>
            </div>
            {/* Billing Cycle Tabs */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setBillingCycle("yearly")}
              >
                Billed Yearly
              </button>
              <button
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Billed Monthly
              </button>
            </div>
          </div>
          {/* Currency Selector */}
          <div className="relative flex">
            <p className="text-md font-bold my-auto text-gray-900 mr-2">
              Prices in
            </p>
            <div className="relative">
              <button
                className="flex items-center justify-between w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              >
                <span className="flex items-center">
                  <span className="text-gray-900 font-medium">
                    {currencyRates[currency].name}
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    currencyDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    fillRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {currencyDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="py-1">
                    {Object.entries(currencyRates).map(([code, data]) => (
                      <button
                        key={code}
                        className={`flex items-center w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                          currency === code
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          setCurrency(code as keyof CurrencyRates);
                          setCurrencyDropdownOpen(false);
                        }}
                      >
                        <span className="font-medium">{data.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({data.symbol})
                        </span>
                        {currency === code && (
                          <svg
                            className="w-5 h-5 ml-auto text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              clipRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              fillRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index: number) => {
            const price =
              billingCycle === "yearly"
                ? product.annual_price
                : product.monthly_price;
            const formattedPrice = formatPrice(price);

            // Determine button text and action based on current plan
            const isCurrentPlan = currentPlan === product.product_id;
            const buttonText = isCurrentPlan ? "Current" : "Upgrade Now";
            const buttonAction = isCurrentPlan
              ? undefined
              : () => handleUpgradeClick(product);

            return (
              <div
                key={product.product_id}
                className={`bg-white rounded-xl shadow-lg border-2 relative overflow-hidden ${
                  product.max_users > 1 ? "border-green-400" : "border-gray-200"
                }`}
              >
                {product.max_users > 1 && (
                  <div className="bg-green-100 text-green-700 text-xs px-3 py-1 absolute top-4 right-4 rounded-full font-semibold">
                    Up to {product.max_users} users
                  </div>
                )}
                <div className="p-8">
                  {/* Plan Name & Details */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.product_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {product.plan_name}
                  </p>
                  {product.max_users > 1 && (
                    <p className="text-sm text-blue-600 mb-4">
                      Create a team workspace
                      <span className="inline-flex items-center">
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            clipRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                    </p>
                  )}
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-[10px] text-gray-500 mr-1">
                        {currencyRates[currency].name}
                      </span>
                      <span className="text-4xl text-gray-900">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-gray-500 ml-3 -translate-y-4">
                          {billingCycle === "yearly"
                            ? `per user/month · ${formatPrice(
                                price * 12
                              )} billed yearly`
                            : billingCycle === "monthly" &&
                                product.plan_name === "Business"
                              ? "plus local tax · per user/month"
                              : "per user/month"}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {product.plan_name === "Beginner"
                        ? "An account with:"
                        : product.plan_name === "Pro"
                          ? "Everything in Beginner, plus:"
                          : "Everything in Pro for every member, plus:"}
                    </h4>
                    <ul className="space-y-3">
                      {product.features_ids.map(
                        (featureId: string, i: number) => {
                          const feature = featureMapping[featureId];
                          if (!feature) return null;
                          return (
                            <li key={i} className="flex items-start group">
                              <CheckCircle className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <div
                                className="flex items-center"
                                onMouseEnter={(e) =>
                                  handleMouseEnter(e, featureId)
                                }
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span className="text-sm text-gray-700">
                                  {feature.name}
                                </span>
                                {feature.description && (
                                  <HelpCircle className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                                )}
                              </div>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="mt-8">
                    <Button
                      className={`w-full py-3 text-base font-medium ${
                        isCurrentPlan
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      onClick={buttonAction}
                      disabled={isCurrentPlan}
                    >
                      {buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.product_name}</DialogTitle>
            <DialogDescription>
              Complete your payment to upgrade your subscription plan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) =>
                    handlePaymentFormChange("cardNumber", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={paymentForm.cardName}
                  onChange={(e) =>
                    handlePaymentFormChange("cardName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) =>
                    handlePaymentFormChange("expiryDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) =>
                    handlePaymentFormChange("cvv", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Billing Address</Label>
              <Textarea
                id="address"
                placeholder="123 Main Street"
                value={paymentForm.address}
                onChange={(e) =>
                  handlePaymentFormChange("address", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={paymentForm.city}
                  onChange={(e) =>
                    handlePaymentFormChange("city", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={(value) =>
                    handlePaymentFormChange("country", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="10001"
                  value={paymentForm.postalCode}
                  onChange={(e) =>
                    handlePaymentFormChange("postalCode", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-lg">
                  {selectedPlan &&
                    formatPrice(
                      billingCycle === "yearly"
                        ? selectedPlan.annual_price
                        : selectedPlan.monthly_price
                    )}
                  {billingCycle === "yearly" ? "/year" : "/month"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-black bg-opacity-90 text-white text-xs rounded py-2 px-3 pointer-events-none z-50 max-w-xs shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}

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
            Questions about our plans? We&apos;re here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/faq"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

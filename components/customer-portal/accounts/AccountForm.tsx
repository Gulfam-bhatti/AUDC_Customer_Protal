"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, User, CreditCard, Settings, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FormData {
  company_name: string;
  company_registration_no: string;
  contact_name: string;
  contact_number: string;
  contact_email: string;
  billing_name: string;
  billing_email: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  tax_no: string;
  preference_currency: string;
  timezone: string;
  payment_method: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  company_name: "",
  company_registration_no: "",
  contact_name: "",
  contact_number: "",
  contact_email: "",
  billing_name: "",
  billing_email: "",
  billing_address_line1: "",
  billing_address_line2: "",
  billing_city: "",
  billing_state: "",
  billing_postal_code: "",
  billing_country: "",
  tax_no: "",
  preference_currency: "USD",
  timezone: "",
  payment_method: "",
  is_active: true,
};

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
];

const paymentMethods = [
  { value: "credit_card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "invoice", label: "Invoice" },
];

export default function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionStatus("idle");

    // Destructure the form data to match the Supabase table schema
    const {
      company_name,
      company_registration_no,
      contact_name,
      contact_number,
      contact_email,
      billing_name,
      billing_email,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      tax_no,
      is_active,
      preference_currency,
      timezone,
      payment_method,
    } = formData;

    try {
      // Perform the insert into the 'customer_portal.accounts' table
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("accounts")
        .insert([
          {
            company_name,
            company_registration_no,
            contact_name,
            contact_number,
            contact_email,
            billing_name,
            billing_email,
            billing_address_line1,
            billing_address_line2,
            billing_city,
            billing_state,
            billing_postal_code,
            billing_country,
            tax_no,
            is_active,
            preference_currency,
            timezone,
            payment_method,
            // You may need to add created_by/modified_by fields based on your auth setup
          },
        ]);

      if (error) {
        console.error("Error submitting form:", error);
        setSubmissionStatus("error");
      } else {
        console.log("Form submitted successfully:", data);
        setSubmissionStatus("success");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-2xl mx-auto rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Company Account Registration
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Please fill out all the information below to create your company
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Company Details Section */}
            <div className="space-y-4 rounded-lg p-6 bg-gray-50 border border-gray-200">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                <Building2 className="w-5 h-5 text-gray-600" /> Company Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      updateFormData("company_name", e.target.value)
                    }
                    placeholder="Enter your company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_registration_no">
                    Company Registration Number
                  </Label>
                  <Input
                    id="company_registration_no"
                    value={formData.company_registration_no}
                    onChange={(e) =>
                      updateFormData("company_registration_no", e.target.value)
                    }
                    placeholder="Enter registration number (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 rounded-lg p-6 bg-gray-50 border border-gray-200">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5 text-gray-600" /> Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      updateFormData("contact_name", e.target.value)
                    }
                    placeholder="Enter primary contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      updateFormData("contact_email", e.target.value)
                    }
                    placeholder="Enter contact email address"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) =>
                    updateFormData("contact_number", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="space-y-4 rounded-lg p-6 bg-gray-50 border border-gray-200">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                <CreditCard className="w-5 h-5 text-gray-600" /> Billing Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_name">Billing Name *</Label>
                  <Input
                    id="billing_name"
                    value={formData.billing_name}
                    onChange={(e) =>
                      updateFormData("billing_name", e.target.value)
                    }
                    placeholder="Name for billing"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_email">Billing Email *</Label>
                  <Input
                    id="billing_email"
                    type="email"
                    value={formData.billing_email}
                    onChange={(e) =>
                      updateFormData("billing_email", e.target.value)
                    }
                    placeholder="Email for billing notifications"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_address_line1">Address Line 1 *</Label>
                <Input
                  id="billing_address_line1"
                  value={formData.billing_address_line1}
                  onChange={(e) =>
                    updateFormData("billing_address_line1", e.target.value)
                  }
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_address_line2">Address Line 2</Label>
                <Input
                  id="billing_address_line2"
                  value={formData.billing_address_line2}
                  onChange={(e) =>
                    updateFormData("billing_address_line2", e.target.value)
                  }
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_city">City *</Label>
                  <Input
                    id="billing_city"
                    value={formData.billing_city}
                    onChange={(e) =>
                      updateFormData("billing_city", e.target.value)
                    }
                    placeholder="City"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_state">State/Province *</Label>
                  <Input
                    id="billing_state"
                    value={formData.billing_state}
                    onChange={(e) =>
                      updateFormData("billing_state", e.target.value)
                    }
                    placeholder="State or Province"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_postal_code">Postal Code *</Label>
                  <Input
                    id="billing_postal_code"
                    value={formData.billing_postal_code}
                    onChange={(e) =>
                      updateFormData("billing_postal_code", e.target.value)
                    }
                    placeholder="Postal/ZIP code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_country">Country *</Label>
                  <Input
                    id="billing_country"
                    value={formData.billing_country}
                    onChange={(e) =>
                      updateFormData("billing_country", e.target.value)
                    }
                    placeholder="Country"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_no">Tax Number</Label>
                <Input
                  id="tax_no"
                  value={formData.tax_no}
                  onChange={(e) => updateFormData("tax_no", e.target.value)}
                  placeholder="VAT/Tax ID (optional)"
                />
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="space-y-4 rounded-lg p-6 bg-gray-50 border border-gray-200">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                <Settings className="w-5 h-5 text-gray-600" /> Account Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preference_currency">
                    Preferred Currency
                  </Label>
                  <Select
                    value={formData.preference_currency}
                    onValueChange={(value) =>
                      updateFormData("preference_currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => updateFormData("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Preferred Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    updateFormData("payment_method", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    updateFormData("is_active", checked as boolean)
                  }
                />
                <Label htmlFor="is_active" className="text-sm">
                  Activate account immediately after creation
                </Label>
              </div>
            </div>

            {/* Submission Button and Status */}
            <div className="space-y-4 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center gap-2"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
              {submissionStatus === "success" && (
                <div className="text-center text-green-600 font-semibold flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> Account created successfully!
                </div>
              )}
              {submissionStatus === "error" && (
                <div className="text-center text-red-600 font-semibold">
                  Failed to create account. Please try again.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

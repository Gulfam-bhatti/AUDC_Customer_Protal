"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, User, CreditCard, Settings } from "lucide-react";

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

export default function AccountViewPage() {
  const [account, setAccount] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        window.location.href = "http://localhost:3000/app/onboard/welcome";
        return;
      }

      const userId = userData.user.id;



      // Fetch account of current user
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("accounts")
        .select("*")
        .eq("created_by", userId)
        .maybeSingle();

      if (error || !data) {
        window.location.href = "http://localhost:3000/app/onboard/welcome";
      } else {
        setAccount(data as FormData);
      }

      setLoading(false);
    };

    fetchAccount();
  }, []);

  if (loading) {
    return <div className="text-center p-6">Loading account...</div>;
  }

  if (!account) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-5xl mx-auto rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Your Account
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Below are your company account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Company Details */}
            <div className="space-y-2 bg-gray-50 p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Company Details
              </h4>
              <p>
                <Label>Company Name:</Label> {account.company_name}
              </p>
              <p>
                <Label>Registration No:</Label>{" "}
                {account.company_registration_no || "N/A"}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 bg-gray-50 p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5" /> Contact Information
              </h4>
              <p>
                <Label>Contact Name:</Label> {account.contact_name}
              </p>
              <p>
                <Label>Email:</Label> {account.contact_email}
              </p>
              <p>
                <Label>Phone:</Label> {account.contact_number || "N/A"}
              </p>
            </div>

            {/* Billing Info */}
            <div className="space-y-2 bg-gray-50 p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Billing Information
              </h4>
              <p>
                <Label>Name:</Label> {account.billing_name}
              </p>
              <p>
                <Label>Email:</Label> {account.billing_email}
              </p>
              <p>
                <Label>Address:</Label> {account.billing_address_line1},{" "}
                {account.billing_address_line2 || ""}
              </p>
              <p>
                <Label>City:</Label> {account.billing_city}
              </p>
              <p>
                <Label>State:</Label> {account.billing_state}
              </p>
              <p>
                <Label>Postal Code:</Label> {account.billing_postal_code}
              </p>
              <p>
                <Label>Country:</Label> {account.billing_country}
              </p>
              <p>
                <Label>Tax No:</Label> {account.tax_no || "N/A"}
              </p>
            </div>

            {/* Account Settings */}
            <div className="space-y-2 bg-gray-50 p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" /> Account Settings
              </h4>
              <p>
                <Label>Currency:</Label> {account.preference_currency}
              </p>
              <p>
                <Label>Timezone:</Label> {account.timezone}
              </p>
              <p>
                <Label>Payment Method:</Label> {account.payment_method}
              </p>
              <p>
                <Label>Status:</Label>{" "}
                {account.is_active ? "Active ✅" : "Inactive ❌"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

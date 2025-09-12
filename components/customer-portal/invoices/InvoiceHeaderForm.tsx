"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface Account {
  account_id: string;
  company_name: string;
}

interface InvoiceHeader {
  invoice_id?: string;
  account_id: string;
  billing_cycle?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  currency: string;
  failed_payment_count: number;
  subtotal_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  tax_amount?: number;
}

interface InvoiceHeaderFormProps {
  invoice?: InvoiceHeader;
  onSave: () => void;
  onCancel: () => void;
}

const billingCycles = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "one-time", label: "One-time" },
];

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

const currencies = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
  { value: "PKR", label: "PKR" },
];

export function InvoiceHeaderForm({
  invoice,
  onSave,
  onCancel,
}: InvoiceHeaderFormProps) {
  const [formData, setFormData] = useState<InvoiceHeader>({
    account_id: "",
    billing_cycle: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "draft",
    currency: "USD",
    failed_payment_count: 0,
    subtotal_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    tax_amount: 0,
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
    getCurrentUser();
    if (invoice) {
      setFormData({
        ...invoice,
        start_date: invoice.start_date?.split("T")[0] || "",
        end_date: invoice.end_date?.split("T")[0] || "",
      });
    }
  }, [invoice]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error: any) {
      console.error("Error getting current user:", error.message);
      toast.error("Error getting current user");
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("accounts")
        .select("account_id, company_name")
        .eq("is_active", true)
        .order("company_name");

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast.error("Error fetching accounts: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.account_id) {
      toast.error("Please select an account");
      return;
    }

    if (!currentUserId) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      // Clean data - convert empty strings to null for optional UUID fields
      const cleanData = {
        account_id: formData.account_id || null,
        billing_cycle: formData.billing_cycle || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status,
        currency: formData.currency,
        failed_payment_count: formData.failed_payment_count || 0,
        subtotal_amount: formData.subtotal_amount || null,
        discount_amount: formData.discount_amount || null,
        total_amount: formData.total_amount || null,
        tax_amount: formData.tax_amount || null,
        created_by: currentUserId, // Add created_by field
      };

      if (invoice?.invoice_id) {
        const { error } = await supabase
          .schema("customer_portal")
          .from("invoice_headers")
          .update(cleanData)
          .eq("invoice_id", invoice.invoice_id);

        if (error) throw error;
        toast.success("Invoice updated successfully");
      } else {
        const { error } = await supabase
          .schema("customer_portal")
          .from("invoice_headers")
          .insert([cleanData]);

        if (error) throw error;
        toast.success("Invoice created successfully");
      }
      onSave();
    } catch (error: any) {
      toast.error("Error saving invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-6">
        {invoice?.invoice_id ? "Edit Invoice" : "Add New Invoice"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account */}
            <div>
              <Label>Account *</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, account_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.account_id} value={a.account_id}>
                      {a.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Billing Cycle */}
            <div>
              <Label>Billing Cycle</Label>
              <Select
                value={formData.billing_cycle || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, billing_cycle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                name="end_date"
                value={formData.end_date || ""}
                onChange={handleChange}
              />
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div>
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Subtotal Amount</Label>
              <Input
                type="number"
                name="subtotal_amount"
                step="0.01"
                min="0"
                value={formData.subtotal_amount || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Discount Amount</Label>
              <Input
                type="number"
                name="discount_amount"
                step="0.01"
                min="0"
                value={formData.discount_amount || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Tax Amount</Label>
              <Input
                type="number"
                name="tax_amount"
                step="0.01"
                min="0"
                value={formData.tax_amount || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                name="total_amount"
                step="0.01"
                min="0"
                value={formData.total_amount || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Failed Payment Count</Label>
              <Input
                type="number"
                name="failed_payment_count"
                min="0"
                value={formData.failed_payment_count || 0}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-4">
          <Button type="submit" disabled={loading || !formData.account_id || !currentUserId}>
            {loading ? "Saving..." : "Save Invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

interface InvoiceLine {
  invoice_line_id?: string;
  invoice_id: string;
  product_id?: string;
  tenant_id?: string;
  quantity?: number;
  currency: string;
  line_number?: number;
  line_subtotal?: number;
  line_discount?: number;
  line_tax?: number;
  line_total?: number;
}

interface InvoiceLineFormProps {
  line?: InvoiceLine;
  invoiceHeaderId: string;
  onSave: () => void;
  onCancel: () => void;
}

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' },
  { value: 'AUD', label: 'AUD' },
];

export function InvoiceLineForm({ line, invoiceHeaderId, onSave, onCancel }: InvoiceLineFormProps) {
  const [formData, setFormData] = useState<InvoiceLine>({
    invoice_id: invoiceHeaderId,
    product_id: "",
    tenant_id: "",
    quantity: 1,
    currency: "USD",
    line_number: 1,
    line_subtotal: 0,
    line_discount: 0,
    line_tax: 0,
    line_total: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (line) {
      setFormData(line);
    }
  }, [line]);

  useEffect(() => {
    // Calculate line total when values change
    const subtotal = formData.line_subtotal || 0;
    const discount = formData.line_discount || 0;
    const tax = formData.line_tax || 0;
    const total = subtotal - discount + tax;
    
    setFormData(prev => ({ ...prev, line_total: total }));
  }, [formData.line_subtotal, formData.line_discount, formData.line_tax]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (line?.invoice_line_id) {
        // Update existing line
        const { error } = await supabase
          .from("invoice_lines")
          .update(formData)
          .eq("invoice_line_id", line.invoice_line_id);

        if (error) {
          toast.error("Error updating invoice line: " + error.message);
        } else {
          toast.success("Invoice line updated successfully");
          onSave();
        }
      } else {
        // Create new line
        const { error } = await supabase.from("invoice_lines").insert([formData]);

        if (error) {
          toast.error("Error creating invoice line: " + error.message);
        } else {
          toast.success("Invoice line created successfully");
          onSave();
        }
      }
    } catch (error) {
      toast.error("Error saving invoice line");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">
        {line?.invoice_line_id ? "Edit Invoice Line" : "Add New Invoice Line"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Line Item Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="line_number">Line Number</Label>
              <Input
                id="line_number"
                name="line_number"
                type="number"
                min="1"
                value={formData.line_number || 1}
                onChange={handleChange}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <Label htmlFor="product_id">Product ID</Label>
              <Input
                id="product_id"
                name="product_id"
                value={formData.product_id || ""}
                onChange={handleChange}
                placeholder="Enter product ID"
              />
            </div>

            <div>
              <Label htmlFor="tenant_id">Tenant ID</Label>
              <Input
                id="tenant_id"
                name="tenant_id"
                value={formData.tenant_id || ""}
                onChange={handleChange}
                placeholder="Enter tenant ID"
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={formData.quantity || 1}
                onChange={handleChange}
                placeholder="1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="line_subtotal">Line Subtotal</Label>
              <Input
                id="line_subtotal"
                name="line_subtotal"
                type="number"
                step="0.01"
                min="0"
                value={formData.line_subtotal || 0}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="line_discount">Line Discount</Label>
              <Input
                id="line_discount"
                name="line_discount"
                type="number"
                step="0.01"
                min="0"
                value={formData.line_discount || 0}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="line_tax">Line Tax</Label>
              <Input
                id="line_tax"
                name="line_tax"
                type="number"
                step="0.01"
                min="0"
                value={formData.line_tax || 0}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="line_total">Line Total</Label>
              <Input
                id="line_total"
                name="line_total"
                type="number"
                step="0.01"
                value={formData.line_total?.toFixed(2) || "0.00"}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Calculated: Subtotal - Discount + Tax
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Line Item"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
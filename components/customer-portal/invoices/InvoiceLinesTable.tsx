"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface InvoiceLine {
  invoice_line_id: string;
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
  created_at: string;
}

interface InvoiceLinesTableProps {
  invoiceHeaderId: string;
  onEdit: (line: InvoiceLine) => void;
  onAdd: () => void;
  onBack: () => void;
  refresh: boolean;
}

export function InvoiceLinesTable({ invoiceHeaderId, onEdit, onAdd, onBack, refresh }: InvoiceLinesTableProps) {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [invoiceHeader, setInvoiceHeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceLines();
    fetchInvoiceHeader();
  }, [refresh, invoiceHeaderId]);

  const fetchInvoiceHeader = async () => {
    try {
      const { data, error } = await supabase
        .from("invoice_headers")
        .select(`
          *,
          account:accounts(company_name)
        `)
        .eq("invoice_id", invoiceHeaderId)
        .single();

      if (error) {
        toast.error("Error fetching invoice header: " + error.message);
      } else {
        setInvoiceHeader(data);
      }
    } catch (error) {
      toast.error("Error fetching invoice header");
    }
  };

  const fetchInvoiceLines = async () => {
    try {
      const { data, error } = await supabase
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoiceHeaderId)
        .order("line_number", { ascending: true });

      if (error) {
        toast.error("Error fetching invoice lines: " + error.message);
      } else {
        setLines(data || []);
      }
    } catch (error) {
      toast.error("Error fetching invoice lines");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoice_line_id: string) => {
    if (!confirm("Are you sure you want to delete this invoice line?")) return;

    try {
      const { error } = await supabase.from("invoice_lines").delete().eq("invoice_line_id", invoice_line_id);

      if (error) {
        toast.error("Error deleting invoice line: " + error.message);
      } else {
        toast.success("Invoice line deleted successfully");
        fetchInvoiceLines();
      }
    } catch (error) {
      toast.error("Error deleting invoice line");
    }
  };

  if (loading) {
    return <div className="p-4">Loading invoice lines...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invoice Lines</h1>
            {invoiceHeader && (
              <p className="text-sm text-gray-600">
                Invoice ID: {invoiceHeader.invoice_id.substring(0, 8)}... - {invoiceHeader.account?.company_name}
              </p>
            )}
          </div>
        </div>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Line Item
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Line #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Line Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lines.map((line) => (
              <tr key={line.invoice_line_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {line.line_number || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.product_id ? line.product_id.substring(0, 8) + "..." : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.tenant_id ? line.tenant_id.substring(0, 8) + "..." : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.quantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.currency} {line.line_subtotal?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.currency} {line.line_discount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.currency} {line.line_tax?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {line.currency} {line.line_total?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(line)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(line.invoice_line_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No invoice lines found. Click "Add Line Item" to create your first line item.
          </div>
        )}
        {lines.length > 0 && (
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex justify-end">
              <span className="text-sm font-medium">
                Total: {invoiceHeader?.currency || 'USD'} {lines.reduce((sum, line) => sum + (line.line_total || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
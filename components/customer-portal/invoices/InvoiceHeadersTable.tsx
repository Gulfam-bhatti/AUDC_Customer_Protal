"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface InvoiceHeader {
  invoice_id: string;
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
  created_at: string;
  account?: {
    company_name: string;
  };
}

interface InvoiceHeadersTableProps {
  onEdit: (invoice: InvoiceHeader) => void;
  onAdd: () => void;
  onViewLines: (invoiceId: string) => void;
  refresh: boolean;
}

export function InvoiceHeadersTable({
  onEdit,
  onAdd,
  onViewLines,
  refresh,
}: InvoiceHeadersTableProps) {
  const [invoices, setInvoices] = useState<InvoiceHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [refresh]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select(
          `
          *,
          account:accounts(company_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error fetching invoice headers: " + error.message);
      } else {
        setInvoices(data || []);
      }
    } catch (error) {
      toast.error("Error fetching invoice headers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoice_id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this invoice? This will also delete all associated invoice lines."
      )
    )
      return;

    try {
      const { error } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .delete()
        .eq("invoice_id", invoice_id);

      if (error) {
        toast.error("Error deleting invoice: " + error.message);
      } else {
        toast.success("Invoice deleted successfully");
        fetchInvoices();
      }
    } catch (error) {
      toast.error("Error deleting invoice");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-4">Loading invoice headers...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Headers</h1>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Invoice
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Cycle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.invoice_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoice_id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.account?.company_name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.billing_cycle || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.start_date && invoice.end_date
                    ? `${new Date(invoice.start_date).toLocaleDateString()} - ${new Date(invoice.end_date).toLocaleDateString()}`
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.currency}{" "}
                  {invoice.total_amount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status || "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewLines(invoice.invoice_id)}
                      title="View Invoice Lines"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(invoice.invoice_id)}
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
        {invoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No invoice headers found. Click "Add Invoice" to create your first
            invoice.
          </div>
        )}
      </div>
    </div>
  );
}

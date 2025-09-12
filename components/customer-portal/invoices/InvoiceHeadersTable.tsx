"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const getBillingCycleColor = (cycle?: string) => {
    switch (cycle?.toLowerCase()) {
      case "monthly":
        return "bg-blue-100 text-blue-800";
      case "quarterly":
        return "bg-purple-100 text-purple-800";
      case "yearly":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrencyColor = (currency?: string) => {
    switch (currency?.toUpperCase()) {
      case "USD":
        return "bg-indigo-100 text-indigo-800";
      case "PKR":
        return "bg-emerald-100 text-emerald-800";
      case "EUR":
        return "bg-pink-100 text-pink-800";
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

      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Billing Cycle</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice_id}>
              <TableCell className="font-medium">
                {invoice.invoice_id.substring(0, 8)}...
              </TableCell>
              <TableCell>{invoice.account?.company_name || "N/A"}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBillingCycleColor(
                    invoice.billing_cycle
                  )}`}
                >
                  {invoice.billing_cycle || "N/A"}
                </span>
              </TableCell>
              <TableCell>
                {invoice.start_date && invoice.end_date
                  ? `${new Date(invoice.start_date).toLocaleDateString()} - ${new Date(
                      invoice.end_date
                    ).toLocaleDateString()}`
                  : "N/A"}
              </TableCell>
              <TableCell>
                {invoice.total_amount?.toFixed(2) || "0.00"}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status || "Draft"}
                </span>
              </TableCell>
              <TableCell>
                {invoice.currency ? (
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCurrencyColor(
                      invoice.currency
                    )}`}
                  >
                    {invoice.currency}
                  </span>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell className="text-center space-x-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {invoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No invoice headers found. Click "Add Invoice" to create your first
          invoice.
        </div>
      )}
    </div>
  );
}

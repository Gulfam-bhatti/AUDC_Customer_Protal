"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceHeaderForm } from "@/components/customer-portal/invoices/InvoiceHeaderForm";
import { InvoiceHeadersTable } from "@/components/customer-portal/invoices/InvoiceHeadersTable";
import toast from "react-hot-toast";

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

export default function InvoiceHeadersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceHeader | undefined>();
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();

  const handleEdit = (invoice: InvoiceHeader) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingInvoice(undefined);
    setShowForm(true);
  };

  const handleViewLines = (invoiceId: string) => {
    // Ensure invoiceId is valid UUID before navigation
    if (invoiceId && invoiceId.trim()) {
      router.push(`/dashboard/invoice-lines?invoice_id=${encodeURIComponent(invoiceId)}`);
    } else {
      console.error("Invalid invoice ID:", invoiceId);
      toast.error("Invalid invoice ID");
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingInvoice(undefined);
    setRefresh(!refresh);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showForm ? (
        <InvoiceHeaderForm
          invoice={editingInvoice}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <InvoiceHeadersTable
          onEdit={handleEdit}
          onAdd={handleAdd}
          onViewLines={handleViewLines}
          refresh={refresh}
        />
      )}
    </div>
  );
}
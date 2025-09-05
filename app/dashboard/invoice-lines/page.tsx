"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceLineForm } from "@/components/customer-portal/invoices/InvoiceLineForm";
import { InvoiceLinesTable } from "@/components/customer-portal/invoices/InvoiceLinesTable";

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

export default function InvoiceLinesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingLine, setEditingLine] = useState<InvoiceLine | undefined>();
  const [refresh, setRefresh] = useState(false);
  const [invoiceHeaderId, setInvoiceHeaderId] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const invoiceId = searchParams.get('invoice_id');
    if (invoiceId) {
      setInvoiceHeaderId(invoiceId);
    } else {
      // If no invoice_id, redirect back to invoice headers
      router.push('/dashboard/invoice-headers');
    }
  }, [searchParams, router]);

  const handleEdit = (line: InvoiceLine) => {
    setEditingLine(line);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingLine(undefined);
    setShowForm(true);
  };

  const handleBack = () => {
    router.push('/dashboard/invoice-headers');
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingLine(undefined);
    setRefresh(!refresh);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLine(undefined);
  };

  if (!invoiceHeaderId) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showForm ? (
        <InvoiceLineForm
          line={editingLine}
          invoiceHeaderId={invoiceHeaderId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <InvoiceLinesTable
          invoiceHeaderId={invoiceHeaderId}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onBack={handleBack}
          refresh={refresh}
        />
      )}
    </div>
  );
}
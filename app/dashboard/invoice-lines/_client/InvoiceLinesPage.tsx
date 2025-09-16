// app/dashboard/invoice-lines/_client/InvoiceLinesPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceLineForm } from "@/components/customer-portal/invoices/InvoiceLineForm";
import { InvoiceLinesTable } from "@/components/customer-portal/invoices/InvoiceLinesTable";

export default function InvoiceLinesPageClient() {
  const [showForm, setShowForm] = useState(false);
  const [editingLine, setEditingLine] = useState<any>();
  const [refresh, setRefresh] = useState(false);
  const [invoiceHeaderId, setInvoiceHeaderId] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const invoiceId = searchParams.get("invoice_id");
    if (invoiceId && invoiceId.trim()) {
      setInvoiceHeaderId(invoiceId);
    } else {
      router.push("/dashboard/invoice-headers");
    }
  }, [searchParams, router]);

  const handleEdit = (line: any) => {
    setEditingLine(line);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingLine(undefined);
    setShowForm(true);
  };

  const handleBack = () => router.push("/dashboard/invoice-headers");

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
    return (
      <div className="p-4 text-center">
        <p>Loading invoice details...</p>
        <p className="text-sm text-gray-500 mt-2">
          Invoice ID: {searchParams.get("invoice_id") || "Not provided"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showForm ? (
        <InvoiceLineForm
          invoiceHeaderId={invoiceHeaderId}
          editingLine={editingLine}
          onSaved={handleSave}
          onClose={handleCancel}
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

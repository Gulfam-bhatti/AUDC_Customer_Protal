// app/billing/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronRight, Package, Building } from "lucide-react";

interface InvoiceHeader {
  invoice_id: string;
  account_id: string | null;
  billing_cycle: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  currency: string | null;
  failed_payment_count: number | null;
  subtotal_amount: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  tax_amount: number | null;
  created_by: string | null;
  created_at: string;
}

interface InvoiceLine {
  invoice_line_id: string;
  invoice_id: string | null;
  product_id: string | null;
  tenant_id: string | null;
  quantity: number | null;
  currency: string | null;
  line_number: number | null;
  line_subtotal: number | null;
  line_discount: number | null;
  line_tax: number | null;
  line_total: number | null;
  created_by: string | null;
  created_at: string;
  modified_at: string | null;
  modified_by: string | null;
  product?: {
    product_id: string;
    product_name: string;
    plan_name: string;
    monthly_price: number;
    annual_price: number;
    currency: string;
  };
  tenant?: {
    id: string;
    name: string;
    domain: string | null;
  };
}

export default function BillingHistoryPage() {
  const [invoices, setInvoices] = useState<InvoiceHeader[]>([]);
  const [invoiceLines, setInvoiceLines] = useState<Record<string, InvoiceLine[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [loadingLines, setLoadingLines] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceLines = async (invoiceId: string) => {
    if (invoiceLines[invoiceId]) return; // Already loaded

    try {
      setLoadingLines(prev => ({ ...prev, [invoiceId]: true }));

      // Fetch invoice lines
      const { data: linesData, error: linesError } = await supabase
        .schema("customer_portal")
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("line_number", { ascending: true });

      if (linesError) throw linesError;

      // Get unique product IDs and tenant IDs
      const productIds = Array.from(
        new Set(linesData.map((line) => line.product_id).filter(Boolean))
      );
      const tenantIds = Array.from(
        new Set(linesData.map((line) => line.tenant_id).filter(Boolean))
      );

      // Fetch products from shared schema
      const { data: productsData, error: productsError } =
        productIds.length > 0
          ? await supabase
              .schema("shared")
              .from("products")
              .select(
                "product_id, product_name, plan_name, monthly_price, annual_price, currency"
              )
              .in("product_id", productIds)
          : { data: [], error: null };

      if (productsError) throw productsError;

      // Fetch tenants from shared schema
      const { data: tenantsData, error: tenantsError } =
        tenantIds.length > 0
          ? await supabase
              .schema("shared")
              .from("tenants")
              .select("id, name, domain")
              .in("id", tenantIds)
          : { data: [], error: null };

      if (tenantsError) throw tenantsError;

      // Combine the data
      const combinedLines = linesData.map((line) => ({
        ...line,
        product: productsData?.find((p) => p.product_id === line.product_id),
        tenant: tenantsData?.find((t) => t.id === line.tenant_id),
      }));

      setInvoiceLines(prev => ({ ...prev, [invoiceId]: combinedLines }));
    } catch (err) {
      console.error(`Error fetching lines for invoice ${invoiceId}:`, err);
    } finally {
      setLoadingLines(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const toggleRowExpansion = (invoiceId: string) => {
    setExpandedRows(prev => {
      const newState = { ...prev, [invoiceId]: !prev[invoiceId] };
      if (newState[invoiceId]) {
        fetchInvoiceLines(invoiceId);
      }
      return newState;
    });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.account_id &&
        invoice.account_id.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and manage all your invoices and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input
                placeholder="Search by invoice or account ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchInvoices} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
              Error: {error}
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableCaption>
                {filteredInvoices.length === 0
                  ? "No invoices found"
                  : `Showing ${filteredInvoices.length} invoices`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  // Use React.Fragment with a unique key for the entire invoice row group
                  <React.Fragment key={invoice.invoice_id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRowExpansion(invoice.invoice_id)}
                    >
                      <TableCell>
                        {expandedRows[invoice.invoice_id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.invoice_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{invoice.billing_cycle || "N/A"}</TableCell>
                      <TableCell>
                        {invoice.start_date && invoice.end_date
                          ? `${formatDate(invoice.start_date)} - ${formatDate(invoice.end_date)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          invoice.subtotal_amount,
                          invoice.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          invoice.discount_amount,
                          invoice.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          invoice.tax_amount,
                          invoice.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          invoice.total_amount,
                          invoice.currency || "USD"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    </TableRow>
                    {expandedRows[invoice.invoice_id] && (
                      <TableRow key={`${invoice.invoice_id}-expanded`}>
                        <TableCell colSpan={10} className="p-0">
                          <div className="p-4 bg-muted/20">
                            <h4 className="font-medium mb-3">Invoice Lines</h4>
                            {loadingLines[invoice.invoice_id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                            ) : invoiceLines[invoice.invoice_id]?.length ? (
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[50px]">#</TableHead>
                                      <TableHead>Product</TableHead>
                                      <TableHead>Tenant</TableHead>
                                      <TableHead className="text-right">Quantity</TableHead>
                                      <TableHead className="text-right">Unit Price</TableHead>
                                      <TableHead className="text-right">Discount</TableHead>
                                      <TableHead className="text-right">Tax</TableHead>
                                      <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {invoiceLines[invoice.invoice_id].map((line) => (
                                      <TableRow key={line.invoice_line_id}>
                                        <TableCell className="font-medium">
                                          {line.line_number || "-"}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center">
                                            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <div>
                                              <p className="font-medium">
                                                {line.product?.product_name || "Unknown Product"}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                {line.product?.plan_name || "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center">
                                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <div>
                                              <p className="font-medium">
                                                {line.tenant?.name || "Unknown Tenant"}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                {line.tenant?.domain || "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {line.quantity || 0}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(
                                            line.product?.monthly_price || 0,
                                            line.currency || "USD"
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(
                                            line.line_discount || 0,
                                            line.currency || "USD"
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(
                                            line.line_tax || 0,
                                            line.currency || "USD"
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          {formatCurrency(
                                            line.line_total || 0,
                                            line.currency || "USD"
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">No invoice lines found</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, Building } from "lucide-react";

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

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const { invoice_id } = useParams<{ invoice_id: string }>();
  const [invoice, setInvoice] = useState<InvoiceHeader | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoice_id]);

  const fetchInvoiceDetails = async () => {
    console.log("invoice_id param:", invoice_id);

    try {
      setLoading(true);

      // Fetch invoice header
      const { data: invoiceData, error: invoiceError } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select("*")
        .eq("invoice_id", invoice_id)
        .single();

      if (invoiceError) throw invoiceError;
      setInvoice(invoiceData);

      // Fetch invoice lines
      const { data: linesData, error: linesError } = await supabase
        .schema("customer_portal")
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoice_id)
        .order("line_number", { ascending: true });

      if (linesError) throw linesError;

      // Get unique product IDs and tenant IDs using Array.from() instead of spreading
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

      setInvoiceLines(combinedLines);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error || "Invoice not found"}</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/invoice-headers")}>
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-full mx-auto py-10">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/invoice-headers")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Invoice ID</p>
                <p className="font-medium">{invoice.invoice_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(invoice.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                <p className="font-medium">{invoice.billing_cycle || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium">
                  {invoice.start_date && invoice.end_date
                    ? `${formatDate(invoice.start_date)} - ${formatDate(invoice.end_date)}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-medium">
                  {formatCurrency(
                    invoice.subtotal_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="font-medium">
                  {formatCurrency(
                    invoice.discount_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax</p>
                <p className="font-medium">
                  {formatCurrency(
                    invoice.tax_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium text-lg">
                  {formatCurrency(
                    invoice.total_amount,
                    invoice.currency || "USD"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-medium">
                  {invoice.account_id
                    ? invoice.account_id.substring(0, 8) + "..."
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
                <p className="font-medium">
                  {invoice.failed_payment_count || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(invoice.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Lines</CardTitle>
          <CardDescription>
            Detailed breakdown of products and services in this invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoiceLines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invoice lines found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  {invoiceLines.length} line items in this invoice
                </TableCaption>
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
                  {invoiceLines.map((line) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

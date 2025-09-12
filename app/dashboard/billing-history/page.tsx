"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Search, RefreshCw, Eye, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { BillingStats } from "@/components/customer-portal/billing/billingstates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceHeader {
  invoice_id: string;
  account_id: string;
  account?: { company_name: string };
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
}

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
  product_name?: string;
  tenant_name?: string;
}

export default function BillingHistoryPage() {
  const [invoices, setInvoices] = useState<InvoiceHeader[]>([]);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceHeader[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // State to manage the currently open dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceHeader | null>(null);

  // Fetch invoice headers from Supabase
  const fetchInvoiceHeaders = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("invoice_headers")
        .select(`
          *,
          account:accounts(company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invoice headers:", error);
        toast.error("Error fetching invoice headers: " + error.message);
        return [];
      }
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching invoice headers:", error);
      toast.error("Error fetching invoice headers");
      return [];
    }
  };

  // Fetch invoice lines from Supabase
  const fetchInvoiceLines = async () => {
    try {
      const { data, error } = await supabase
        .schema("customer_portal")
        .from("invoice_lines")
        .select("*")
        .order("line_number", { ascending: true });

      if (error) {
        console.error("Error fetching invoice lines:", error);
        toast.error("Error fetching invoice lines: " + error.message);
        return [];
      }

      const productIds = data?.map(d => d.product_id).filter(Boolean) || [];
      const tenantIds = data?.map(d => d.tenant_id).filter(Boolean) || [];

      let products: { product_id: string; product_name: string }[] = [];
      let tenants: { id: string; name: string }[] = [];

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .schema("shared")
          .from("products")
          .select("product_id, product_name")
          .in("product_id", productIds);
        products = productsData || [];
      }

      if (tenantIds.length > 0) {
        const { data: tenantsData } = await supabase
          .schema("shared")
          .from("tenants")
          .select("id, name")
          .in("id", tenantIds);
        tenants = tenantsData || [];
      }

      const linesWithNames = (data || []).map((line: InvoiceLine) => ({
        ...line,
        product_name: products.find(p => p.product_id === line.product_id)?.product_name,
        tenant_name: tenants.find(t => t.id === line.tenant_id)?.name,
      }));

      return linesWithNames;
    } catch (error: unknown) {
      console.error("Error fetching invoice lines:", error);
      toast.error("Error fetching invoice lines");
      return [];
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoiceHeaders, invoiceLines] = await Promise.all([
        fetchInvoiceHeaders(),
        fetchInvoiceLines()
      ]);
      setInvoices(invoiceHeaders);
      setLines(invoiceLines);
      setFilteredInvoices(invoiceHeaders);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading billing data");
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation functions remain the same
  const totalPaid = invoices.filter(inv => inv.status?.toLowerCase() === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalInvoices = invoices.length;
  const nextPayment = invoices.filter(inv => inv.status?.toLowerCase() === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const primaryCurrency = invoices.length > 0 ? invoices[0].currency || "USD" : "USD";

  useEffect(() => {
    let filtered = invoices;
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.account?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const handleRefresh = () => {
    loadData();
  };

  const getInvoiceLines = (invoiceId: string) => {
    return lines.filter(line => line.invoice_id === invoiceId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBillingCycleColor = (cycle?: string) => {
    switch (cycle?.toLowerCase()) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annually': return 'bg-orange-100 text-orange-800';
      case 'one-time': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewInvoice = (invoice: InvoiceHeader) => {
    setCurrentInvoice(invoice);
    setDialogOpen(true);
  };

  const downloadInvoice = async (invoice: InvoiceHeader) => {
    const invoiceElement = document.getElementById("invoice-bill-pdf-target");
    if (!invoiceElement) {
      toast.error("Invoice element not found!");
      return;
    }

    toast.loading("Generating PDF...", { id: "download-toast" });

    try {
      const canvas = await html2canvas(invoiceElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoice_id.substring(0, 8)}.pdf`);
      toast.success("PDF downloaded successfully!", { id: "download-toast" });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download invoice.", { id: "download-toast" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Billing History</h3>
            <p className="text-slate-500">Fetching invoice data from database...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Billing History
            </h1>
            <p className="text-slate-600 mt-2">View and manage your complete billing history</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Section */}
        <BillingStats
          totalPaid={totalPaid}
          totalInvoices={totalInvoices}
          nextPayment={nextPayment}
          currency={primaryCurrency}
        />

        {/* Filters Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Filter & Search</CardTitle>
            <CardDescription>Find specific invoices and billing records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by company name or invoice ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Headers Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Invoice Headers ({filteredInvoices.length})</CardTitle>
            <CardDescription>Click on an invoice to view line items</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell className="font-medium">{invoice.invoice_id.substring(0, 12)}...</TableCell>
                      <TableCell>{invoice.account?.company_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getBillingCycleColor(invoice.billing_cycle)}>
                          {invoice.billing_cycle || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.start_date && invoice.end_date
                          ? `${new Date(invoice.start_date).toLocaleDateString()} - ${new Date(invoice.end_date).toLocaleDateString()}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">{invoice.currency} {invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-emerald-50"
                            onClick={() => downloadInvoice(invoice)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No invoices found</h3>
                <p className="text-slate-500">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search criteria or filters" : "You don't have any invoices yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Lines Table (remains the same) */}
        {selectedInvoiceId && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Invoice Line Items - {selectedInvoiceId.substring(0, 12)}...</CardTitle>
              <CardDescription>Detailed breakdown of services and products for this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              {getInvoiceLines(selectedInvoiceId).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Line #</TableHead>
                      <TableHead>Product/Service</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getInvoiceLines(selectedInvoiceId).map((line) => (
                      <TableRow key={line.invoice_line_id}>
                        <TableCell>{line.line_number || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{line.product_name || 'N/A'}</TableCell>
                        <TableCell>{line.tenant_name || 'N/A'}</TableCell>
                        <TableCell>{line.quantity || 0}</TableCell>
                        <TableCell>{line.currency} {line.line_subtotal?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{line.currency} {line.line_discount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{line.currency} {line.line_tax?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="font-semibold">{line.currency} {line.line_total?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No line items found for this invoice.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary Footer */}
        {filteredInvoices.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-600">
                    Showing {filteredInvoices.length} of {invoices.length} invoices
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      {primaryCurrency} {filteredInvoices.filter(inv => inv.status?.toLowerCase() === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-slate-500">Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-yellow-600">
                      {primaryCurrency} {filteredInvoices.filter(inv => inv.status?.toLowerCase() === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-slate-500">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-red-600">
                      {primaryCurrency} {filteredInvoices.filter(inv => inv.status?.toLowerCase() === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-slate-500">Overdue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* The Dialog Component */}
        {currentInvoice && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <div id="invoice-bill-pdf-target" className="p-8 bg-white print:p-0">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-3xl font-bold text-gray-800">Invoice</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Invoice ID: {currentInvoice.invoice_id}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-between items-start mb-8 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-800">Billed to:</p>
                    <p>{currentInvoice.account?.company_name || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p><span className="font-semibold">Date:</span> {new Date(currentInvoice.created_at).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Status:</span> {currentInvoice.status}</p>
                    <p><span className="font-semibold">Period:</span> {new Date(currentInvoice.start_date!).toLocaleDateString()} - {new Date(currentInvoice.end_date!).toLocaleDateString()}</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product/Service</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getInvoiceLines(currentInvoice.invoice_id).map((line) => (
                      <TableRow key={line.invoice_line_id}>
                        <TableCell>{line.product_name || line.tenant_name || 'N/A'}</TableCell>
                        <TableCell>{line.quantity}</TableCell>
                        <TableCell className="text-right">{currentInvoice.currency} {((line.line_total || 0) / (line.quantity || 1)).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{currentInvoice.currency} {line.line_total?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-8">
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>{currentInvoice.currency} {currentInvoice.subtotal_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax ({((currentInvoice.tax_amount! / currentInvoice.subtotal_amount!) * 100).toFixed(2) || "0.00"}%):</span>
                      <span>{currentInvoice.currency} {currentInvoice.tax_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-4 mt-4">
                      <span>TOTAL:</span>
                      <span>{currentInvoice.currency} {currentInvoice.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t flex justify-end">
                <Button onClick={() => downloadInvoice(currentInvoice)} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
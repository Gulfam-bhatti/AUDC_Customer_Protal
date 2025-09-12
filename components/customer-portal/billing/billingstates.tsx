import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, FileText, Calendar } from "lucide-react";

interface BillingStatsProps {
  totalPaid: number;
  totalInvoices: number;
  nextPayment: number;
  currency: string;
}

export function BillingStats({ totalPaid, totalInvoices, nextPayment, currency }: BillingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {currency} {totalPaid.toFixed(2)}
              </p>
              <p className="text-sm text-slate-600">Total Paid</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{totalInvoices}</p>
              <p className="text-sm text-slate-600">Total Invoices</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {currency} {nextPayment.toFixed(2)}
              </p>
              <p className="text-sm text-slate-600">Next Payment</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
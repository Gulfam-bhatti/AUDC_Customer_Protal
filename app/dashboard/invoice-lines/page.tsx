// app/dashboard/invoice-lines/page.tsx
import { Suspense } from "react";
import InvoiceLinesPageClient from "./_client/InvoiceLinesPage";

export default function InvoiceLinesPage() {
  return (
    <Suspense fallback={<p className="p-4 text-center">Loading invoice page...</p>}>
      <InvoiceLinesPageClient />
    </Suspense>
  );
}
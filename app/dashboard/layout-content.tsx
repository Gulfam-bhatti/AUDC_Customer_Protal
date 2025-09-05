"use client";
import { Toaster } from "react-hot-toast";
import type React from "react";

import { SidebarDemo } from "@/components/customer-portal/sidebar";
import { useState } from "react";

export default function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState("tenant");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-800">
      {/* Sidebar fixed height */}
      <SidebarDemo open={isMobileOpen} setOpen={setIsMobileOpen} />

      {/* Main content should scroll independently */}
      <main className="flex-1 overflow-y-auto p-4 dark:text-white bg-white dark:bg-neutral-900 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 m-2">
        {children}
        <Toaster />
      </main>
    </div>
  );
}

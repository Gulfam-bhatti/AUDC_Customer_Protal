"use client";
import React, { Suspense } from "react";
import AddTenantPageInner from "./_page";

export default function AddTenantPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddTenantPageInner />
    </Suspense>
  );
}

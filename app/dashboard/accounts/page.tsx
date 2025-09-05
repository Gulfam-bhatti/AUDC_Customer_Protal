"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountsTable } from "@/components/customer-portal/accounts/AccountsTable";

export default function AccountsPage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="p-6">
      <AccountsTable
        onEdit={(account) =>
          router.push(`/accounts/${account.account_id}/edit`)
        }
        onAdd={() => router.push("/accounts/new")}
        refresh={refresh}
      />
    </div>
  );
}

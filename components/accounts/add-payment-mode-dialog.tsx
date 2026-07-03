"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PaymentModeFormDialog } from "@/components/accounts/payment-mode-form-dialog";

export function AddPaymentModeDialog({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium"
      >
        <Plus className="size-3.5" />
        Add
      </button>
      <PaymentModeFormDialog open={open} onOpenChange={setOpen} accountId={accountId} />
    </>
  );
}

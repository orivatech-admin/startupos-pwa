"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModeFormDialog } from "@/components/accounts/payment-mode-form-dialog";

export function AddPaymentModeDialog({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-primary"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Add payment mode
      </Button>
      <PaymentModeFormDialog open={open} onOpenChange={setOpen} accountId={accountId} />
    </>
  );
}

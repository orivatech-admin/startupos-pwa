"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModeFormDialog } from "@/components/accounts/payment-mode-form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { PaymentModeIcon } from "@/lib/categories";
import { canMutateRecord } from "@/lib/permissions";
import { deletePaymentMode } from "@/app/(app)/accounts/actions";
import type { Database, PaymentModeKind, UserRole } from "@/lib/supabase/types";

const KIND_LABELS: Record<PaymentModeKind, string> = {
  upi: "UPI",
  cheque: "Cheque",
  internet_banking: "Internet Banking",
  debit_card: "Debit Card",
};

type PaymentMode = Database["public"]["Tables"]["payment_modes"]["Row"];

export function PaymentModeRow({
  mode,
  accountId,
  currentUserId,
  currentUserRole,
}: {
  mode: PaymentMode;
  accountId: string;
  currentUserId?: string;
  currentUserRole?: UserRole;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const canEditOrDelete = canMutateRecord(currentUserRole, currentUserId, mode.created_by);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <PaymentModeIcon kind={mode.kind} className="size-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{mode.name}</p>
        <p className="text-xs text-muted-foreground">{KIND_LABELS[mode.kind]}</p>
      </div>
      {canEditOrDelete ? (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit payment mode"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete payment mode"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : null}

      <PaymentModeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        accountId={accountId}
        paymentMode={mode}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this payment mode?"
        description={`"${mode.name}" will be permanently removed. This can't be undone.`}
        onConfirm={() => deletePaymentMode(mode.id)}
      />
    </div>
  );
}

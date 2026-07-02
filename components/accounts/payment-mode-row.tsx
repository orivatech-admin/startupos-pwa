"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Payment mode options"
              className="shrink-0 text-muted-foreground"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditOpen(true); }}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => { e.preventDefault(); setDeleteOpen(true); }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

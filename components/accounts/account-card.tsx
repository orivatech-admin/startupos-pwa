"use client";

import { useState, useTransition } from "react";
import { ChevronDown, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentModeRow } from "@/components/accounts/payment-mode-row";
import { AddPaymentModeDialog } from "@/components/accounts/add-payment-mode-dialog";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AccountTypeIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { canMutateRecord } from "@/lib/permissions";
import { deleteAccount, setDefaultAccount } from "@/app/(app)/accounts/actions";
import type { Database, UserRole } from "@/lib/supabase/types";

type Account = Database["public"]["Tables"]["accounts"]["Row"] & {
  balance: number;
  paymentModes: Database["public"]["Tables"]["payment_modes"]["Row"][];
};

export function AccountCard({
  account,
  currentUserId,
  currentUserRole,
}: {
  account: Account;
  currentUserId?: string;
  currentUserRole?: UserRole;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canEditOrDelete = canMutateRecord(currentUserRole, currentUserId, account.created_by);

  function handleSetDefault() {
    startTransition(async () => {
      const result = await setDefaultAccount(account.id);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex w-full items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <AccountTypeIcon accountType={account.account_type} className="size-5" />
          <span className="flex flex-1 items-center gap-2">
            <p className="text-sm font-medium">{account.name}</p>
            {account.is_default ? (
              <Badge variant="secondary" className="text-[10px]">
                Default
              </Badge>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account options"
              className="shrink-0 text-muted-foreground"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isPending || account.is_default}
              onSelect={(e) => { e.preventDefault(); handleSetDefault(); }}
            >
              <Star className="size-4" />
              {account.is_default ? "Default account" : "Set as default"}
            </DropdownMenuItem>
            {canEditOrDelete ? (
              <>
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
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expanded ? (
        <div className="border-t border-border">
          {account.paymentModes.length === 0 ? (
            <div className="px-2 py-1">
              <AddPaymentModeDialog accountId={account.id} />
            </div>
          ) : (
            <>
              <p className="px-4 pt-3 text-xs text-muted-foreground">Payment modes</p>
              <div className="divide-y divide-border">
                {account.paymentModes.map((mode) => (
                  <PaymentModeRow
                    key={mode.id}
                    mode={mode}
                    accountId={account.id}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                  />
                ))}
              </div>
              <Separator />
              <div className="px-2 py-1">
                <AddPaymentModeDialog accountId={account.id} />
              </div>
            </>
          )}
        </div>
      ) : null}

      <AccountFormDialog open={editOpen} onOpenChange={setEditOpen} account={account} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this account?"
        description={`"${account.name}" and its linked payment modes will be permanently removed. This can't be undone.`}
        onConfirm={() => deleteAccount(account.id)}
      />
    </Card>
  );
}

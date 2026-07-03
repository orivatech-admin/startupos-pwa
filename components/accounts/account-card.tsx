"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { AccountTypeIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { setDefaultAccount } from "@/app/(app)/accounts/actions";
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
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
          onClick={() => setEditOpen(true)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <AccountTypeIcon accountType={account.account_type} className="size-5" />
          <p className="flex-1 text-sm font-medium">{account.name}</p>
        </button>
        <button
          type="button"
          onClick={handleSetDefault}
          disabled={isPending || account.is_default}
          aria-label={account.is_default ? "Default account" : "Set as default"}
          className="shrink-0 text-muted-foreground disabled:opacity-100"
        >
          <Star className={cn("size-4", account.is_default && "fill-primary text-primary")} />
        </button>
      </div>

      <AccountFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        account={account}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </Card>
  );
}

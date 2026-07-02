"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount, updateAccount } from "@/app/(app)/accounts/actions";
import type { AccountType, Database } from "@/lib/supabase/types";

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "bank_account", label: "Bank Account" },
  { value: "wallet", label: "Wallet" },
  { value: "credit_card", label: "Credit Card" },
];

type Account = Database["public"]["Tables"]["accounts"]["Row"];

// Mounted only while the dialog is open, so its useState always starts fresh
// from the current `account` prop — no effect-based reset needed.
function AccountFormFields({
  account,
  onOpenChange,
}: {
  account?: Account;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(account?.name ?? "");
  const [accountType, setAccountType] = useState<AccountType>(
    account?.account_type ?? "bank_account"
  );
  const [openingBalance, setOpeningBalance] = useState(String(account?.opening_balance ?? 0));
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = account
        ? await updateAccount(account.id, name, accountType, Number(openingBalance) || 0)
        : await createAccount(name, accountType, Number(openingBalance) || 0);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{account ? "Edit account" : "New account"}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            placeholder="e.g. Bank Account"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Account type</Label>
          <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="opening-balance">Opening balance</Label>
          <Input
            id="opening-balance"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? <AccountFormFields account={account} onOpenChange={onOpenChange} /> : null}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="icon" variant="ghost" aria-label="Add account" onClick={() => setOpen(true)}>
        <Plus className="size-5" />
      </Button>
      <AccountFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Pencil, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { PaymentModeIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Database, PaymentModeKind } from "@/lib/supabase/types";

const KIND_LABELS: Record<PaymentModeKind, string> = {
  upi: "UPI",
  cheque: "Cheque",
  internet_banking: "Internet Banking",
  debit_card: "Debit Card",
};

type PaymentMode = Database["public"]["Tables"]["payment_modes"]["Row"];

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary" : "border-muted-foreground"
      )}
    >
      {selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
    </span>
  );
}

export function PaymentModePickerSheet({
  paymentModes,
  value,
  onChange,
  disabled,
}: {
  paymentModes: PaymentMode[];
  value?: string;
  onChange: (paymentModeId: string | undefined) => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selected = paymentModes.find((m) => m.id === value);

  function select(id: string | undefined) {
    onChange(id);
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex w-full items-center gap-3 rounded-lg py-2 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <PaymentModeIcon kind={selected?.kind ?? "upi"} className={cn("size-4", !selected && "opacity-40")} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium">
              {selected?.name ?? "Select payment mode"}
            </span>
            {selected ? (
              <span className="block text-xs text-muted-foreground">
                {KIND_LABELS[selected.kind]}
              </span>
            ) : null}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between space-y-0">
          <DrawerTitle>Select Payment Mode</DrawerTitle>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/accounts")}
              aria-label="Manage accounts"
              className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            >
              <Pencil className="size-4" />
            </button>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
              >
                <X className="size-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto px-4 pb-6">
          <button
            type="button"
            onClick={() => select(undefined)}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
          >
            <RadioDot selected={!value} />
            <span className="text-sm text-muted-foreground">None</span>
          </button>
          {paymentModes.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              No payment modes added for this account yet.
            </p>
          ) : (
            paymentModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => select(mode.id)}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
              >
                <RadioDot selected={mode.id === value} />
                <span className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                  <PaymentModeIcon kind={mode.kind} className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm">{mode.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {KIND_LABELS[mode.kind]}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

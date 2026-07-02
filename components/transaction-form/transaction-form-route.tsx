"use client";

import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/transaction-form/transaction-form";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof TransactionForm>, "onClose" | "onSaved"> & {
  mode: "modal" | "page";
};

export function TransactionFormRoute({ mode, ...formProps }: Props) {
  const router = useRouter();

  function handleClose() {
    if (mode === "modal") {
      router.back();
    } else {
      router.push("/home");
    }
  }

  function handleSaved() {
    if (mode === "modal") {
      router.back();
    } else {
      router.push("/transactions");
    }
  }

  return <TransactionForm {...formProps} onClose={handleClose} onSaved={handleSaved} />;
}

"use client";

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TransactionType } from "@/lib/supabase/types";

const TYPES: {
  value: TransactionType;
  label: string;
  icon: typeof ArrowUpRight;
}[] = [
  { value: "expense", label: "Expense", icon: ArrowUpRight },
  { value: "income", label: "Income", icon: ArrowDownLeft },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight },
];

export function TypeTabs({
  value,
  onChange,
}: {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TransactionType)}>
      <TabsList variant="line" className="h-auto w-full gap-0 border-b border-border p-0">
        {TYPES.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex-1 gap-1.5 rounded-none py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:bottom-0 after:h-[2px] after:bg-primary"
          >
            <t.icon className="size-4" />
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

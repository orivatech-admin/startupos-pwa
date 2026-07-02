"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { CashFlowPeriod, CashFlowTotals } from "@/lib/queries";

const PERIODS: { value: CashFlowPeriod; label: string }[] = [
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
  { value: "allTime", label: "All Time" },
];

export function CashFlowCard({
  data,
}: {
  data: Record<CashFlowPeriod, CashFlowTotals>;
}) {
  const [period, setPeriod] = useState<CashFlowPeriod>("thisMonth");
  const totals = data[period];
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? "This Month";
  const netPrefix = totals.netBalance > 0 ? "+" : totals.netBalance < 0 ? "-" : "";

  return (
    <Card className="gap-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cash Flow
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium"
            >
              {periodLabel}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PERIODS.map((p) => (
              <DropdownMenuItem key={p.value} onSelect={() => setPeriod(p.value)}>
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-expense">Spending</p>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.spending)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-income">Income</p>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.income)}</p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Net Balance</p>
        <p className="text-base font-semibold tabular-nums">
          {netPrefix}
          {formatCurrency(Math.abs(totals.netBalance))}
        </p>
      </div>
    </Card>
  );
}

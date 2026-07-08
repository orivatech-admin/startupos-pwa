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
import { StatTile } from "@/components/analysis/stat-tile";
import { CategoryDonut } from "@/components/analysis/category-donut";
import { formatCurrency } from "@/lib/utils";
import type { CashFlowPeriod, AnalysisPeriodStats } from "@/lib/queries";

const PERIODS: { value: CashFlowPeriod; label: string }[] = [
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
  { value: "allTime", label: "All Time" },
];

export function AnalysisSummary({
  byPeriod,
  totalBalance,
}: {
  byPeriod: Record<CashFlowPeriod, AnalysisPeriodStats>;
  totalBalance: number;
}) {
  const [period, setPeriod] = useState<CashFlowPeriod>("thisMonth");
  const stats = byPeriod[period];
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? "This Month";
  const showMonthlyAvg = period !== "thisMonth";

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
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

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Total balance" value={formatCurrency(totalBalance)} />
        <StatTile label={`Transactions · ${periodLabel}`} value={String(stats.count)} />
        <StatTile
          label={`Spent · ${periodLabel}`}
          value={formatCurrency(stats.spend)}
          tone="expense"
        />
        <StatTile
          label={showMonthlyAvg ? "Avg monthly spend" : "Avg daily spend"}
          value={formatCurrency(showMonthlyAvg ? stats.avgMonthlySpend : stats.avgDailySpend)}
        />
      </div>

      <Card className="gap-4 p-4">
        <p className="text-sm font-medium">Top categories · {periodLabel}</p>
        {stats.categoryBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
        ) : (
          <CategoryDonut items={stats.categoryBreakdown} />
        )}
      </Card>
    </>
  );
}

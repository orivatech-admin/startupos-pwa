import { cn } from "@/lib/utils";

interface MonthlyPoint {
  label: string;
  income: number;
  expense: number;
}

const CHART_HEIGHT = 140;
const LABEL_THRESHOLD_PCT = 18;

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const heightPct = max > 0 ? (value / max) * 100 : 0;
  const showLabel = heightPct >= LABEL_THRESHOLD_PCT;

  return (
    <div className="flex h-full w-3.5 flex-col items-center justify-end">
      {showLabel ? (
        <span className="mb-1 text-[10px] leading-none text-muted-foreground">
          {formatCompact(value)}
        </span>
      ) : null}
      <div
        className={cn("w-full rounded-t-sm", className)}
        style={{ height: `${Math.max(heightPct, value > 0 ? 2 : 0)}%` }}
      />
    </div>
  );
}

function formatCompact(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function MonthlyBarChart({ data }: { data: MonthlyPoint[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-income" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-chart-expense" />
          Expense
        </span>
      </div>
      <div className="flex justify-between gap-1" style={{ height: CHART_HEIGHT }}>
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-0 min-h-0 flex-1 items-end gap-1">
              <Bar value={point.income} max={max} className="bg-chart-income" />
              <Bar value={point.expense} max={max} className="bg-chart-expense" />
            </div>
            <span className="text-[11px] text-muted-foreground">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { format, isToday, isYesterday } from "date-fns";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/components/transaction-list/transaction-row";
import type { TransactionListItem } from "@/lib/queries";

function groupByDay(transactions: TransactionListItem[]) {
  const groups = new Map<string, TransactionListItem[]>();
  for (const t of transactions) {
    const key = format(new Date(t.date_time), "yyyy-MM-dd");
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  return Array.from(groups.entries());
}

function dayLabel(dateKey: string) {
  const date = new Date(dateKey);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMM");
}

export function TransactionList({
  transactions,
  emptyTitle = "No transactions yet",
  emptyDescription = "Start by adding your first expense, income, or transfer.",
}: {
  transactions: TransactionListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (transactions.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <ArrowLeftRight className="size-5" />
        </div>
        <div>
          <p className="text-base font-medium">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      </Card>
    );
  }

  const groups = groupByDay(transactions);

  return (
    <div className="flex flex-col">
      {groups.map(([dateKey, items]) => (
        <div key={dateKey}>
          <p className="px-4 pb-1 pt-4 text-xs text-muted-foreground">{dayLabel(dateKey)}</p>
          <div className="divide-y divide-border">
            {items.map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

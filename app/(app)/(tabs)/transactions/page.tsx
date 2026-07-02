import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTransactionsForRecords } from "@/lib/queries";
import { TransactionList } from "@/components/transaction-list/transaction-list";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: undefined, label: "All" },
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
] as const;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType =
    type === "expense" || type === "income" || type === "transfer" ? type : undefined;

  const supabase = await createClient();
  const transactions = await getTransactionsForRecords(supabase, activeType);
  const emptyTitle = activeType ? `No ${activeType} transactions yet` : "No transactions yet";
  const emptyDescription = activeType
    ? `Transactions you add of this type will show up here.`
    : "Start by adding your first expense, income, or transfer.";

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-semibold">Transactions</h1>
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/transactions?type=${filter.value}` : "/transactions"}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
              activeType === filter.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <TransactionList
        transactions={transactions}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}

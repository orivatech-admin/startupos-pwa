import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAnalysisData } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/analysis/stat-tile";
import { MonthlyBarChart } from "@/components/analysis/monthly-bar-chart";
import { CategoryBarList } from "@/components/analysis/category-bar-list";
import { formatCurrency } from "@/lib/utils";

export default async function AnalysisPage() {
  const supabase = await createClient();
  const {
    monthly,
    categoryBreakdown,
    totalBalance,
    thisMonthSpend,
    thisMonthCount,
    avgDailySpend,
    hasActivity,
  } = await getAnalysisData(supabase);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Analysis</h1>

      {!hasActivity ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <p className="text-base font-medium">No analytics available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add transactions to view reports, trends, and spending
              breakdowns.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Total balance" value={formatCurrency(totalBalance)} />
            <StatTile label="Transactions this month" value={String(thisMonthCount)} />
            <StatTile
              label="Spent this month"
              value={formatCurrency(thisMonthSpend)}
              tone="expense"
            />
            <StatTile label="Avg daily spend" value={formatCurrency(avgDailySpend)} />
          </div>

          <Card className="gap-4 p-4">
            <p className="text-sm font-medium">Income vs expense · last 6 months</p>
            <MonthlyBarChart data={monthly} />
          </Card>

          <Card className="gap-4 p-4">
            <p className="text-sm font-medium">Top categories · last 3 months</p>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
            ) : (
              <CategoryBarList items={categoryBreakdown} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}

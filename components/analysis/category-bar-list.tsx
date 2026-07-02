import { formatCurrency } from "@/lib/utils";

interface CategoryAmount {
  name: string;
  amount: number;
}

export function CategoryBarList({ items }: { items: CategoryAmount[] }) {
  const max = Math.max(1, ...items.map((item) => item.amount));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.name} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(item.amount / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

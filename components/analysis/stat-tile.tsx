import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "income" | "expense";
}) {
  return (
    <div className="rounded-lg border border-glass-border bg-glass p-3 shadow-lg shadow-black/20 backdrop-blur-xl dark:bg-white/5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-base font-medium text-foreground",
          tone === "income" && "text-income",
          tone === "expense" && "text-expense"
        )}
      >
        {value}
      </p>
    </div>
  );
}

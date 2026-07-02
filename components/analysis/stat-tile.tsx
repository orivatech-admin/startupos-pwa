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
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md">
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

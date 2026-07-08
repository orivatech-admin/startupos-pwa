import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TransactionFormSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-glass-border bg-glass px-4 py-3 backdrop-blur-xl dark:bg-card/50">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-28 pt-4">
        <Skeleton className="h-10 w-full shrink-0 rounded-full" />

        <Card className="shrink-0 items-center gap-3 p-4">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-9 w-full border-t border-border pt-3" />
        </Card>

        <Card className="shrink-0 gap-0 p-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5 px-4 py-2.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </Card>

        <Card className="shrink-0 gap-0 p-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5 px-4 py-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

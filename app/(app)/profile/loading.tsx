import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
      <div className="flex items-center gap-3 border-b border-glass-border bg-glass px-4 py-3 backdrop-blur-xl dark:bg-card/50">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pt-8 pb-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <Card className="gap-0 divide-y divide-border p-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-4 shrink-0 rounded" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1.5 h-3.5 w-28" />
              </div>
            </div>
          ))}
        </Card>

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

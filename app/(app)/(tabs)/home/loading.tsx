import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="size-10 shrink-0 rounded-full" />
      </div>

      <Card className="gap-3 p-4">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-8 w-40" />
      </Card>

      <div>
        <div className="flex items-center justify-between px-1 pb-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-12" />
        </div>
        <Card className="gap-0 divide-y divide-border p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-3.5 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-2 shrink-0 rounded-full" />
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

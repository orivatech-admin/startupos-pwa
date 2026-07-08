import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsLoading() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <Card className="gap-2 p-4">
        <Skeleton className="h-3 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-20" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="gap-3 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-24" />
          </Card>
        ))}
      </div>
    </div>
  );
}

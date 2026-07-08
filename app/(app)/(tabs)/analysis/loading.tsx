import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisLoading() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <Skeleton className="h-5 w-24" />

      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      </Card>

      <Card className="gap-4 p-4">
        <Skeleton className="h-4 w-48" />
        <div className="flex h-40 items-end gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${40 + ((i * 17) % 60)}%` }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

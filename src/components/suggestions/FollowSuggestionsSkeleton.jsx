import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FollowSuggestionsSkeleton({ compact = false }) {
  if (compact) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 pr-1 no-scrollbar snap-x snap-mandatory">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="min-w-[220px] snap-start rounded-2xl border border-border/70 bg-muted/30 p-4"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
              <Skeleton className="mt-4 h-9 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </CardHeader>

      <CardContent className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-border/70 p-3"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

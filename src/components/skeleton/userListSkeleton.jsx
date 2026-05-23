import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />

            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-[160px] sm:w-[250px] rounded" />
              <Skeleton className="h-4 w-[120px] sm:w-[200px] rounded" />
            </div>
          </div>

          <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
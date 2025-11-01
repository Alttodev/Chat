import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersListSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-border shadow-sm">
          <CardContent className="p-4 flex items-start gap-6">
            {/* Avatar placeholder */}
            <Skeleton className="h-24 w-24 rounded-full" />

            {/* User info placeholders */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

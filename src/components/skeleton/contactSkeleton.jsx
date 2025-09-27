import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
            {/* Avatar skeleton */}
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />

            {/* Text skeleton */}
            <div className="flex flex-col space-y-1">
              <div className="w-24 h-3 bg-muted rounded animate-pulse" />
              <div className="w-16 h-2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

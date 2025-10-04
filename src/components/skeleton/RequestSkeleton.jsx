import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonRequest() {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200">
      {/* Left side: Avatar and text */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px] rounded" />
          <Skeleton className="h-4 w-[200px] rounded" />
        </div>
      </div>

      {/* Right side: buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

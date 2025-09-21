import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

export function PostFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        {/* Textarea skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton className="w-full h-[90px] rounded-md" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="flex justify-end">
        <Skeleton className="w-20 h-10 rounded-lg" />
      </div>
    </div>
  );
}

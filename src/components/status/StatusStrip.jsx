import { useRef } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDetail } from "@/hooks/authHooks";
import {
  useMyStatus,
  useStatusFeed,
  useUploadStatus,
} from "@/hooks/statusHooks";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useStatusViewerStore } from "@/lib/zustand";

function StatusBubble({
  label,
  online,
  image,
  fallback,
  highlight = false,
  compact = false,
  onClick,
  caption,
  onAddClick,
}) {
  return (
    <div className="group flex shrink-0 snap-center flex-col items-center gap-2 text-center">
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "relative flex items-center justify-center rounded-full p-[2px] transition-transform duration-200 group-hover:scale-105",
            compact ? "h-14 w-14 md:h-16 md:w-16" : "h-16 w-16 md:h-20 md:w-20",
            highlight
              ? "border-2 border-dashed border-emerald-500/75 bg-transparent shadow-none"
              : "bg-gradient-to-br from-emerald-300/80 via-emerald-200/60 to-cyan-300/70",
          )}
        >
          {!highlight ? (
            <span className="absolute inset-0 rounded-full bg-white/20 blur-md" />
          ) : null}
          <Avatar className="h-full w-full border-2 border-background">
            <AvatarImage
              className="h-full w-full object-cover object-top"
              src={image || "/placeholder.svg"}
              alt={label}
            />
            <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">
              {fallback}
            </AvatarFallback>
          </Avatar>
        </button>

        {highlight ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddClick?.();
            }}
            className="absolute -right-0 -bottom-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-600 text-white shadow-sm transition hover:scale-110"
            aria-label="Add status"
          >
            <Plus className="h-3 w-3" />
          </button>
        ) : (
          <div
            className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-background ${
              online ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
        )}
      </div>

      <span
        className={cn(
          "truncate text-[14px] sm:text-base font-medium ",
          compact ? "w-16" : "w-20",
        )}
      >
        {label}
      </span>
      {caption ? (
        <span className="max-w-20 truncate text-[11px] text-muted-foreground">
          {caption}
        </span>
      ) : null}
    </div>
  );
}

function StatusBubbleSkeleton({ compact = false }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2 text-center">
      <div
        className={cn(
          "rounded-full p-[2px] bg-gradient-to-br from-emerald-200 via-emerald-100 to-cyan-100",
          compact ? "h-14 w-14 md:h-16 md:w-16" : "h-16 w-16 md:h-20 md:w-20",
        )}
      >
        <Skeleton className="h-full w-full rounded-full bg-emerald-100/80" />
      </div>
      <Skeleton className={cn("h-3 rounded-full", compact ? "w-16" : "w-20")} />
      <Skeleton className={cn("h-2 rounded-full", compact ? "w-12" : "w-14")} />
    </div>
  );
}

export function StatusStrip({ compact = false, className }) {
  const { data: profileData } = useUserDetail();
  const { data: myStatusData } = useMyStatus();
  const { data: feedData, isLoading, isFetching } = useStatusFeed();
  const { mutateAsync: uploadStatus, isPending: isUploading } =
    useUploadStatus();
  const { profileId } = useAuthStore();
  const { openStatus } = useStatusViewerStore();
  const fileInputRef = useRef(null);
  const currentUser = profileData?.profile;
  const myStatus = myStatusData?.status || null;
  const statuses = feedData?.statuses || [];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", "");

    await uploadStatus(formData);
  };

  const visibleStatuses = statuses
    .filter((item) => {
      const friendId =
        item?.user?._id?.toString?.() || item?.user?.id?.toString?.();
      return friendId && friendId !== profileId?.toString?.();
    })
    .slice(0, compact ? 6 : 10);

  return (
    <section
      className={cn(
        "fixed top-16 left-0 right-0 z-40 mx-auto w-full border-emerald-100/80 bg-background/95 from-emerald-50 via-background to-cyan-50 p-3 sm:p-4 md:left-64 md:right-80 md:top-16 md:mx-4 md:w-auto rounded-sm md:border md:border-emerald-100/70 md:bg-white/80 md:backdrop-blur-xl md:shadow-[0_14px_40px_rgba(15,23,42,0.08)] md:p-4 lg:p-5",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <div className="overflow-x-auto overflow-y-hidden pb-2 no-scrollbar md:pb-1">
        <div className="flex w-max min-w-max snap-x snap-mandatory gap-3 pr-6 md:gap-4">
          <StatusBubble
            highlight
            label={isUploading ? "Uploading..." : "Your status"}
            image={myStatus?.image || currentUser?.profileImage}
            fallback={currentUser?.userName?.charAt(0).toUpperCase() || "Y"}
            compact={compact}
            onClick={() => {
              if (myStatus) {
                openStatus({ status: myStatus, user: currentUser });
                return;
              }

              handleUploadClick();
            }}
            onAddClick={handleUploadClick}
            caption={myStatus?.caption || ""}
          />

          {isLoading
            ? Array.from({ length: compact ? 4 : 6 }).map((_, index) => (
                <StatusBubbleSkeleton
                  key={`status-skeleton-${index}`}
                  compact={compact}
                />
              ))
            : visibleStatuses.map((entry) => {
                const friend = entry?.status?.user ;
                const userId = friend?._id || friend?.id;
                const statusId =
                  entry?.status?.id || entry?.status?._id || userId;

                if (!friend || !userId) return null;

                return (
                  <StatusBubble
                    key={statusId}
                    label={friend.userName}
                    online={friend.isOnline}
                    image={entry?.status?.image}
                    fallback={friend.userName?.charAt(0).toUpperCase() || "-"}
                    compact={compact}
                    caption={entry?.status?.caption}
                    onClick={() =>
                      openStatus({
                        status: {
                          ...entry.status,
                          id: statusId,
                          user: friend,
                        },
                        user: friend,
                      })
                    }
                  />
                );
              })}

          {!isLoading && isFetching ? (
            <StatusBubbleSkeleton compact={compact} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default StatusStrip;

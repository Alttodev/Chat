import { useUserStatus } from "@/hooks/statusHooks";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";

import { cn } from "@/lib/utils";
import { useImageModalStore, useStatusViewerStore } from "@/lib/zustand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "react-router-dom";

function StatusBubble({
  label,
  hasMedia,
  online,
  image,
  fallback,
  onClick,
  open,
  user,
}) {
  const poster =
    image && isVideoMediaUrl(image) ? getVideoPosterUrl(image) : "";
  const isVideoPreview = image && isVideoMediaUrl(image);

  return (
    <div className="group flex shrink-0 snap-center flex-col items-center gap-2 text-center">
      <div className="relative">
        {hasMedia ? (
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "relative mt-1 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer h-24 w-24",
              hasMedia
                ? "status-ring"
                : "ring-3 bg-gray-300 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600",
            )}
          >
            <Avatar className="relative z-10 h-[calc(100%-6px)] w-[calc(100%-6px)] border-2 border-background">
              {isVideoPreview ? (
                <div className="h-full w-full overflow-hidden rounded-full">
                  <img
                    className="h-full w-full object-cover object-top"
                    src={poster || image || "/placeholder.svg"}
                    alt={label}
                  />
                </div>
              ) : (
                <>
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={image || "/placeholder.svg"}
                    alt={label}
                  />
                  <AvatarFallback className="bg-emerald-50 font-semibold text-emerald-700">
                    {fallback}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
          </button>
        ) : (
          <Avatar
            className="h-24 w-24 border-2 border-background cursor-pointer"
            onClick={() => {
              if (!isVideoPreview && user?.profileImage) {
                open(user.profileImage);
              }
            }}
          >
            <AvatarImage
              className="h-full w-full object-cover object-top"
              src={image || "/placeholder.svg"}
              alt={label}
            />
            <AvatarFallback className="bg-emerald-50 font-semibold text-emerald-700">
              {fallback}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${
            online ? "bg-green-500" : "bg-yellow-500"
          }`}
        />
      </div>
    </div>
  );
}

export function StatusUserStrip({ className, user }) {
  const { id } = useParams();
  const { data: statusData } = useUserStatus(id);

  const userStatus = statusData?.statuses?.[0];
  const { openStatus } = useStatusViewerStore();
  const { open } = useImageModalStore();

  const hasMyStatus = Boolean(userStatus?.image);

  return (
    <section className={cn("relative z-40 mx-auto w-auto", className)}>
      <div
        className={`overflow-x-auto overflow-y-hidden ${
          userStatus ? "p-2" : "p-0"
        } no-scrollbar md:pb-1`}
      >
        <div className="flex w-max min-w-max snap-x snap-mandatory gap-3  md:gap-4">
          {/* Current user bubble — always visible, green ring only if has status */}
          <StatusBubble
            hasMedia={hasMyStatus}
            online={user?.isOnline}
            image={user?.profileImage}
            fallback={user?.userName?.charAt(0).toUpperCase() || "Y"}
            open={open}
            user={user}
            onClick={() => {
              if (!userStatus) return;

              openStatus({
                status: userStatus,
                user,
              });
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default StatusUserStrip;

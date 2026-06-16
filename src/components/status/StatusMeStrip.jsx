import { useMyStatus } from "@/hooks/statusHooks";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";

import { cn } from "@/lib/utils";
import { useImageModalStore, useStatusViewerStore } from "@/lib/zustand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageViewer } from "../modals/imageViewer";

function StatusBubble({
  label,
  hasMedia,
  image,
  fallback,
  compact = false,
  onClick,
  user,
  open,
}) {
  const poster =
    image && isVideoMediaUrl(image) ? getVideoPosterUrl(image) : "";
  const isVideoPreview = image && isVideoMediaUrl(image);

  return (
    <div className="group flex shrink-0 snap-center flex-col items-center gap-2 text-center">
      <div>
        {hasMedia ? (
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "relative  mt-1 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer",
              compact ? "h-14 w-14 md:h-16 md:w-16" : "h-20 w-20",
              " ring-3",
              hasMedia
               ? "bg-emerald-500 ring-emerald-400/60 dark:ring-emerald-500/30"
              : "bg-gray-300 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600",
            )}
          >
            <Avatar className="h-full w-full border-2 border-background">
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
      </div>
    </div>
  );
}

export function StatusMeStrip({ compact = false, className, user }) {
  const { data: myStatusData } = useMyStatus();

  const userStatus = myStatusData?.status;

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
            open={open}
            user={user}
            image={user?.profileImage}
            fallback={user?.userName?.charAt(0).toUpperCase() || "Y"}
            compact={compact}
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
      <ImageViewer />
    </section>
  );
}

export default StatusMeStrip;

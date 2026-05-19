import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDetail } from "@/hooks/authHooks";
import {
  useMyStatus,
  useStatusFeed,
  useUploadStatus,
} from "@/hooks/statusHooks";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useStatusViewerStore } from "@/lib/zustand";
import { StatusDraftModal } from "../modals/statusDraftModal";

const STATUS_UPLOAD_ACCEPT = "image/*,video/mp4";

const isVideoMedia = (value) => {
  const fileName = value?.name?.toLowerCase?.() || "";
  return value?.type === "video/mp4" || fileName.endsWith(".mp4");
};

const isSupportedStatusFile = (file) => {
  if (!file) return false;
  return file.type?.startsWith("image/") || isVideoMedia(file);
};

function StatusBubble({
  label,
  hasMedia,
  online,
  image,
  fallback,
  highlight = false,
  compact = false,
  onClick,
  onAddClick,
}) {
  const poster =
    image && isVideoMediaUrl(image) ? getVideoPosterUrl(image) : "";
  const isVideoPreview = image && isVideoMediaUrl(image);

  return (
    <div className="group flex shrink-0 snap-center flex-col items-center gap-2 text-center">
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "relative ml-1 mt-1 flex cursor-pointer items-center justify-center rounded-full transition-all duration-300",
            compact ? "h-14 w-14 md:h-16 md:w-16" : "h-16 w-16 md:h-20 md:w-20",
            hasMedia
              ? "p-[2px] bg-emerald-500 ring-2 ring-emerald-200/60 dark:ring-emerald-500/20"
              : "p-0 bg-transparent",
          )}
        >
          {!highlight ? (
            <span className="absolute inset-0 rounded-full bg-white/20 blur-md" />
          ) : null}

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
            className={`absolute -bottom-0 right-1 h-4 w-4 rounded-full border-2 border-background ${
              online ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
        )}
      </div>

      <span
        className={cn(
          "truncate text-[14px] font-medium sm:text-base",
          compact ? "w-16" : "w-20",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function StatusStrip({
  compact = false,
  className,
  showDismissButton = false,
  onDismiss,
}) {
  const { data: profileData } = useUserDetail();
  const { data: myStatusData } = useMyStatus();
  const { data: feedData } = useStatusFeed();
  const { mutateAsync: uploadStatus, isPending: isUploading } =
    useUploadStatus();
  const { profileId } = useAuthStore();
  const { openStatus } = useStatusViewerStore();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraftOpen, setIsDraftOpen] = useState(false);

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

    if (!isSupportedStatusFile(file)) {
      toastError("Only image and MP4 files are allowed");
      return;
    }

    setSelectedFile(file);
    setIsDraftOpen(true);
  };

  const handleCancelDraft = () => {
    setSelectedFile(null);
    setIsDraftOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePostStatus = async (caption) => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption || "");

      await uploadStatus(formData);
      handleCancelDraft();
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to upload status");
    }
  };

  const visibleStatuses = statuses
    .filter((item) => {
      const friendId =
        item?.user?._id?.toString?.() || item?.user?.id?.toString?.();
      return friendId && friendId !== profileId?.toString?.();
    })
    .slice(0, compact ? 6 : 10);

  const myStatusImage = myStatus?.image || currentUser?.profileImage;

  return (
    <>
      <section
        className={cn(
          "fixed left-2 right-2 top-16 z-40 mx-auto w-auto rounded-2xl border border-emerald-100/80 bg-background/95 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:left-4 sm:right-4 sm:p-4 md:left-64 md:right-80 md:mx-4 md:w-auto md:rounded-sm md:border md:border-emerald-100/70 md:bg-white/80 md:p-4 md:shadow-[0_14px_40px_rgba(15,23,42,0.08)] lg:p-5 dark:border-white/10 dark:bg-black/95 dark:md:bg-black/90 dark:md:shadow-[0_14px_40px_rgba(0,0,0,0.55)]",
          className,
        )}
      >
        {showDismissButton ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-emerald-100 bg-background/90 text-muted-foreground shadow-sm transition hover:bg-emerald-50 hover:text-foreground sm:right-3 sm:top-3 md:right-4 md:top-4 dark:border-white/10 dark:bg-black/80 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Hide status section"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept={STATUS_UPLOAD_ACCEPT}
          className="hidden"
          onChange={handleUpload}
        />

        <div
          className={cn(
            "overflow-x-auto overflow-y-hidden pb-2 no-scrollbar md:pb-1",
            showDismissButton ? "pr-10" : "",
          )}
        >
          <div className="flex w-max min-w-max snap-x snap-mandatory gap-3 pr-6 md:gap-4">
            <StatusBubble
              highlight
              hasMedia={Boolean(myStatus?.image)}
              label={isUploading ? "Posting..." : "Your status"}
              image={myStatusImage}
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

            {visibleStatuses.map((entry) => {
              const friend = entry?.status?.user;
              const userId = friend?._id || friend?.id;
              const statusId =
                entry?.status?.id || entry?.status?._id || userId;
              const statusImage = entry?.status?.image || friend?.profileImage;

              if (!friend || !userId) return null;

              return (
                <StatusBubble
                  key={statusId}
                  hasMedia={Boolean(entry?.status?.image)}
                  label={friend.userName}
                  online={friend.isOnline}
                  image={statusImage}
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
          </div>
        </div>
      </section>

      <StatusDraftModal
        open={isDraftOpen}
        onOpenChange={setIsDraftOpen}
        file={selectedFile}
        onCancel={handleCancelDraft}
        onPost={handlePostStatus}
        isUploading={isUploading}
      />
    </>
  );
}

export default StatusStrip;

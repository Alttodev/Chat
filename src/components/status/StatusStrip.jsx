import { useRef, useState } from "react";
import { Plus, X, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDetail } from "@/hooks/authHooks";
import {
  useMyStatus,
  useStatusFeed,
  useUploadStatus,
} from "@/hooks/statusHooks";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";
import { toastError, toastSuccess } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useStatusViewerStore } from "@/lib/zustand";
import { StatusDraftModal } from "../modals/statusDraftModal";
import HiddenStatusModal from "../modals/hiddenStatusModal";

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
  isHiddenTile = false,
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
            "relative mt-1 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer h-24 w-24",
            isHiddenTile
              ? "bg-gray-300 opacity-70 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600"
              : hasMedia
                ? "status-ring"
                : " bg-gray-300 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600",
          )}
        >
          <Avatar className="relative z-10 h-[calc(100%-6px)] w-[calc(100%-6px)] border-2 border-background">
            {isHiddenTile ? (
              <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <EyeOff className="h-7 w-7" />
              </AvatarFallback>
            ) : isVideoPreview ? (
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
        ) : isHiddenTile ? null : (
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

export function StatusStrip({ compact = false, className }) {
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
  const [isHiddenModalOpen, setIsHiddenModalOpen] = useState(false);

  const currentUser = profileData?.profile;
  const myStatus = myStatusData?.status || null;
  const statuses = feedData?.statuses || [];
  const hiddenStatuses = feedData?.hiddenStatuses || [];

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

  const handlePostStatus = async ({ caption, backgroundSong }) => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption || "");
      if (backgroundSong) {
        formData.append("backgroundSong", JSON.stringify(backgroundSong));
      }

      const res = await uploadStatus(formData);
      toastSuccess(res?.message);
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
      <section className={cn("relative z-40 mx-auto w-auto  p-2 ", className)}>
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
          )}
        >
          <div className="flex w-max min-w-max snap-x snap-mandatory gap-3 pr-6 md:gap-4">
            <StatusBubble
              highlight
              hasMedia={Boolean(myStatus?.image)}
              label={isUploading ? "Posting..." : "Your story"}
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

            {hiddenStatuses.length > 0 && (
              <StatusBubble
                isHiddenTile
                label="Hidden"
                compact={compact}
                onClick={() => setIsHiddenModalOpen(true)}
              />
            )}
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

      <HiddenStatusModal
        show={isHiddenModalOpen}
        onClose={() => setIsHiddenModalOpen(false)}
        hiddenStatuses={hiddenStatuses}
      />
    </>
  );
}

export default StatusStrip;

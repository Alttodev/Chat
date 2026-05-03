import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, X, Trash2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";
import { useStatusViewerStore } from "@/lib/zustand";

import StatusSeenList from "./StatusSeenList";
import { useMarkStatusSeen, useDeleteStatus } from "@/hooks/statusHooks";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";

const STATUS_DURATION = 5000;

export function StatusViewer() {
  const { isOpen, status, closeStatus } = useStatusViewerStore();

  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);
  const accumulatedProgressRef = useRef(0);
  const statusKeyRef = useRef("");

  const { mutate: markSeen } = useMarkStatusSeen();
  const { mutate: deleteStatus } = useDeleteStatus();
  const hasMarkedSeenRef = useRef(false);

  const currentUserId = useAuthStore((state) => state.profileId);

  const image = status?.status?.image || status?.image || "";
  const caption = status?.status?.caption || status?.caption || "";
  const user = status?.status?.user || status?.user || {};

  const userName = user?.userName || "Status";

  const seenBy = status?.status?.seenBy || status?.seenBy || [];
  const statusId = status?.status?.id || status?.id;

  const isOwner = user?.id === currentUserId;

  const statusTime =
    formatRelative(
      status?.status?.updatedAt ||
        status?.status?.createdAt ||
        status?.updatedAt ||
        status?.createdAt,
    ) || "";

  const fallback = useMemo(() => {
    return userName?.charAt(0)?.toUpperCase() || "S";
  }, [userName]);

  const statusKey =
    status?.status?._id ||
    status?.status?.id ||
    status?._id ||
    status?.id ||
    `${userName}-${image}-${caption}`;

  useEffect(() => {
    if (isOpen && statusId && !hasMarkedSeenRef.current) {
      markSeen(statusId);
      hasMarkedSeenRef.current = true;
    }
  }, [isOpen, statusId, markSeen]);

  const handleDelete = async () => {
    try {
      const res = await deleteStatus();
      closeStatus();
      toastSuccess(res?.message || "Status deleted");
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!isOpen) {
      setProgress(0);
      setIsLoaded(false);
      setIsPaused(false);
      setShowViewers(false);
      progressRef.current = 0;
      accumulatedProgressRef.current = 0;
      statusKeyRef.current = "";
      hasMarkedSeenRef.current = false;
      return;
    }

    const isNewStatus = statusKeyRef.current !== statusKey;

    if (isNewStatus) {
      setProgress(0);
      setIsLoaded(false);
      setIsPaused(false);
      setShowViewers(false);

      progressRef.current = 0;
      accumulatedProgressRef.current = 0;
      startTimeRef.current = performance.now();
      statusKeyRef.current = statusKey;

      hasMarkedSeenRef.current = false;
    } else if (isPaused) {
      accumulatedProgressRef.current = progressRef.current;
      return;
    } else {
      startTimeRef.current = performance.now();
    }

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;

      const nextProgress = Math.min(
        accumulatedProgressRef.current + (elapsed / STATUS_DURATION) * 100,
        100,
      );

      setProgress(nextProgress);
      progressRef.current = nextProgress;

      if (nextProgress >= 100) {
        closeStatus();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, isPaused, statusKey, closeStatus]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeStatus();
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeStatus]);

  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* Progress */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 pt-4 pb-3 text-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage || image} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-white/60">{statusTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="h-10 w-10 flex items-center justify-center cursor-pointer"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-md border z-50">
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-500 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* <button onClick={closeStatus} className="cursor-pointer">
              <X />
            </button> */}
          </div>
        </header>

        {/* Image */}
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="flex flex-1 items-center justify-center px-4 pb-8"
        >
          <div className="relative w-full max-w-[420px] h-full">
            <img
              src={image}
              className={cn(
                "w-full h-full object-contain rounded-3xl transition",
                isLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setIsLoaded(true)}
            />

            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-3xl">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            )}

            {caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white text-sm p-3 rounded-xl">
                {caption}
              </div>
            )}
            {seenBy.length === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewers(true);
                }}
                className="absolute bottom-2 left-40 flex items-center gap-2 bg-black/60 text-white text-[14px] px-3 py-1 rounded-full cursor-pointer"
              >
                <Eye className="w-5 h-5" /> {seenBy.length}
              </button>
            ) : null}
            {isPaused && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                Paused
              </div>
            )}
          </div>
        </button>

        <StatusSeenList
          seenBy={seenBy}
          show={showViewers}
          onClose={() => setShowViewers(false)}
        />
      </div>
    </div>
  );
}

export default StatusViewer;

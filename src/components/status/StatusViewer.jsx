import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";
import { useStatusViewerStore } from "@/lib/zustand";

const STATUS_DURATION = 5000;

export function StatusViewer() {
  const { isOpen, status, closeStatus } = useStatusViewerStore();
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);
  const accumulatedProgressRef = useRef(0);
  const statusKeyRef = useRef("");

  const image = status?.status?.image || status?.image || "";
  const caption = status?.status?.caption || status?.caption || "";
  const user = status?.status?.user || status?.user || {};
  const userName = user?.userName || "Status";
  const statusTime =
    formatRelative(status?.status?.updatedAt || status?.status?.createdAt || status?.updatedAt || status?.createdAt) ||
    "";

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
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!isOpen) {
      setProgress(0);
      setIsLoaded(false);
      setIsPaused(false);
      progressRef.current = 0;
      accumulatedProgressRef.current = 0;
      statusKeyRef.current = "";
      return;
    }

    const isNewStatus = statusKeyRef.current !== statusKey;

    if (isNewStatus) {
      setProgress(0);
      setIsLoaded(false);
      setIsPaused(false);
      progressRef.current = 0;
      accumulatedProgressRef.current = 0;
      startTimeRef.current = window.performance.now();
      statusKeyRef.current = statusKey;
    } else if (isPaused) {
      accumulatedProgressRef.current = progressRef.current;
      return;
    } else {
      startTimeRef.current = window.performance.now();
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

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [closeStatus, isOpen, isPaused, statusKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeStatus();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeStatus, isOpen]);

  if (!isOpen || !status) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      <div className="pointer-events-none absolute left-0 top-0 z-[60] h-1 w-full overflow-hidden bg-white/20">
        <div
          className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex h-full w-full flex-col">
        <header className="flex items-center justify-between px-4 pb-3 pt-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-white/20">
              <AvatarImage src={user?.profileImage || image || "/placeholder.svg"} alt={userName} />
              <AvatarFallback className="bg-white/10 text-white">{fallback}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-xs text-white/60">
                {statusTime || (isLoaded ? "" : "Loading status...")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeStatus}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close status"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <button
          type="button"
          onClick={() => setIsPaused((value) => !value)}
          className="flex flex-1 items-center justify-center px-4 pb-8"
        >
          <div className="relative h-full w-full max-w-[420px]">
            <img
              src={image || "/placeholder.svg"}
              alt={caption || `${userName} status`}
              className={cn(
                "h-full w-full rounded-3xl object-contain shadow-2xl transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setIsLoaded(true)}
            />

            {!isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/5">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            ) : null}

            {caption ? (
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/50 px-4 py-3 text-left text-sm text-white backdrop-blur">
                {caption}
              </div>
            ) : null}

            {isPaused ? (
              <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                Paused
              </div>
            ) : null}
          </div>
        </button>
      </div>
    </div>
  );
}

export default StatusViewer;

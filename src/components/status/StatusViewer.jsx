import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, Trash2, MoreVertical, Music2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { useStatusViewerStore } from "@/lib/zustand";

import StatusSeenList from "./StatusSeenList";
import { useMarkStatusSeen, useDeleteStatus } from "@/hooks/statusHooks";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";

const STATUS_DURATION = 20000;
const MAX_VIDEO_DURATION = 60000;

function SongTicker({ song }) {
  const text = `${song.title}  •  ${song.artist}`;

  return (
    <div className="flex items-center gap-2  px-4 py-2 backdrop-blur-md w-full max-w-[480px] overflow-hidden">
      <Music2 className="h-3.5 w-3.5 shrink-0 text-white animate-spin [animation-duration:3s]" />

      <div className="overflow-hidden flex-1">
        <p className="text-xs text-white font-medium whitespace-nowrap animate-marquee">
          {text}
        </p>
      </div>
    </div>
  );
}

export function StatusViewer() {
  const { isOpen, status, closeStatus } = useStatusViewerStore();

  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mediaDuration, setMediaDuration] = useState(STATUS_DURATION);

  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);
  const accumulatedProgressRef = useRef(0);
  const statusKeyRef = useRef("");
  const videoRef = useRef(null);
  const bgAudioRef = useRef(null);

  const { mutate: markSeen } = useMarkStatusSeen();
  const { mutate: deleteStatus } = useDeleteStatus();
  const hasMarkedSeenRef = useRef(false);

  const currentUserId = useAuthStore((state) => state.profileId);

  const mediaUrl = status?.status?.image || status?.image || "";
  const mediaType =
    status?.status?.resourceType ||
    status?.resourceType ||
    status?.status?.mimeType ||
    status?.mimeType ||
    status?.status?.mimetype ||
    status?.mimetype ||
    "";
  const isVideo = isVideoMediaUrl(mediaUrl, mediaType);
  const videoPoster = getVideoPosterUrl(mediaUrl);
  const caption = status?.status?.caption || status?.caption || "";
  const user = status?.status?.user || status?.user || {};

  const backgroundSong =
    status?.status?.backgroundSong || status?.backgroundSong || null;
  const hasSong = backgroundSong?.src && !isVideo;

  const userName = user?.userName || "Status";
  const seenBy = status?.status?.seenBy || status?.seenBy || [];
  const statusId = status?.status?._id || status?._id;

  const isOwner = user?._id === currentUserId || user?.id === currentUserId;

  const statusTime =
    formatRelative(status?.status?.createdAt || status?.createdAt) || "";

  const fallback = useMemo(() => {
    return userName?.charAt(0)?.toUpperCase() || "S";
  }, [userName]);

  const statusKey =
    status?.status?._id ||
    status?.status?.id ||
    status?._id ||
    status?.id ||
    `${userName}-${mediaUrl}-${caption}`;

  const activeDuration = isVideo
    ? isLoaded
      ? mediaDuration
      : MAX_VIDEO_DURATION
    : STATUS_DURATION;

  const stopAudio = () => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen || !hasSong) return;

    bgAudioRef.current = new Audio(backgroundSong.src);
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.6;
    bgAudioRef.current.play().catch(() => {});

    return () => stopAudio();
  }, [isOpen, hasSong, backgroundSong?.src]);

  useEffect(() => {
    if (!bgAudioRef.current) return;
    if (isPaused) {
      bgAudioRef.current.pause();
    } else {
      bgAudioRef.current.play().catch(() => {});
    }
  }, [isPaused]);

  useEffect(() => () => stopAudio(), []);

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
      toastSuccess(res?.data.message || "Story deleted Successfully");
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
      setMediaDuration(STATUS_DURATION);
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
      setMediaDuration(STATUS_DURATION);

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
        accumulatedProgressRef.current + (elapsed / activeDuration) * 100,
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
  }, [activeDuration, isOpen, isPaused, statusKey, closeStatus]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    if (isPaused) {
      videoRef.current.pause();
      return;
    }

    videoRef.current.play().catch(() => {});
  }, [isVideo, isPaused, mediaUrl]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeStatus();
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeStatus]);

  if (!isOpen || !status) return null;

  const handleVideoMetadata = () => {
    const duration = videoRef.current?.duration;

    if (Number.isFinite(duration) && duration > 0) {
      setMediaDuration(Math.min(duration * 1000, MAX_VIDEO_DURATION));
    }

    setIsLoaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* Progress */}
      <div className="absolute left-0 top-0 h-1 w-full bg-white/20">
        <div
          className="h-[5px] bg-emerald-600"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex h-full flex-col">
        <button
          type="button"
          onClick={closeStatus}
          className="absolute left-2 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Header */}
        <header className="flex items-center justify-between px-2 pb-3 pl-12 pt-4 text-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.profileImage || videoPoster || mediaUrl}
              />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-white/60">{statusTime}</p>
            </div>
          </div>

          {/* menu */}
          <div className="relative flex items-center">
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-32 rounded-md border bg-white shadow-md">
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ── Song ticker row ── */}
        {hasSong && (
          <div className="flex items-center justify-center px-4 pb-2">
            <SongTicker song={backgroundSong} />
          </div>
        )}

        {/* Media */}
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="flex flex-1 items-center justify-center px-4 pb-8"
        >
          <div className="relative flex h-[75vh] w-full max-w-[92vw] items-center justify-center overflow-hidden md:max-w-[720px] lg:max-w-[820px]">
            {isVideo ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                poster={videoPoster || undefined}
                autoPlay
                playsInline
                preload="metadata"
                className={cn(
                  "h-full w-full object-contain transition pointer-events-none",
                  isLoaded ? "opacity-100" : "opacity-0",
                )}
                onLoadedMetadata={handleVideoMetadata}
              />
            ) : (
              <img
                src={mediaUrl}
                className={cn(
                  "h-full w-full object-contain transition",
                  isLoaded ? "opacity-100" : "opacity-0",
                )}
                onLoad={() => setIsLoaded(true)}
                alt={caption || userName}
              />
            )}

            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/5">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 rounded-b-3xl bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-4 pt-14">
              <div className="flex items-end justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  {caption ? (
                    <div className="max-h-24 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <p className="break-words text-sm font-medium leading-relaxed text-white drop-shadow-md sm:text-[15px]">
                        {caption}
                      </p>
                    </div>
                  ) : null}
                </div>

                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowViewers(true);
                    }}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    {seenBy.length}
                  </button>
                )}
              </div>
            </div>

            {isPaused && (
              <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
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

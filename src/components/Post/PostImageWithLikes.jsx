import { useEffect, useRef, useState } from "react";

import { Expand, Volume2, VolumeX, Play, Pause } from "lucide-react";

import { cn } from "@/lib/utils";

import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";

import { MediaCarousel } from "../Carousel/MediaCarousel";

export function PostImageWithLikes({ post, onImageClick, className }) {
  const videoRef = useRef(null);
  const centerIconTimeoutRef = useRef(null);

  const [isMediaReady, setIsMediaReady] = useState(false);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);

  const [isMuted, setIsMuted] = useState(true);

  const [centerIcon, setCenterIcon] = useState(null); // "play" | "pause" | null

  const media =
    typeof post?.image === "string"
      ? post.image
      : Array.isArray(post?.image)
        ? post.image
        : [];

  const firstMedia = Array.isArray(media) ? media[0] : media;

  const isMultipleImages = Array.isArray(media) && media.length > 1;

  const isSingleImage =
    typeof media === "string" || (Array.isArray(media) && media.length === 1);

  const isVideo = isVideoMediaUrl(firstMedia || "");

  const videoPoster = getVideoPosterUrl(firstMedia || "");

  useEffect(() => {
    setIsMediaReady(false);

    setIsVideoPlaying(true);

    setIsPlaying(true);

    setIsMuted(true);
  }, [post?.image]);

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;

    const video = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (isVideoPlaying) {
            video.play().catch(() => {});
            setIsPlaying(true);
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },

      {
        threshold: 0.5,
      },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [isVideo, isVideoPlaying]);

  const showCenterIcon = (type) => {
    setCenterIcon(type);

    if (centerIconTimeoutRef.current)
      clearTimeout(centerIconTimeoutRef.current);

    centerIconTimeoutRef.current = setTimeout(() => {
      setCenterIcon(null);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (centerIconTimeoutRef.current)
        clearTimeout(centerIconTimeoutRef.current);
    };
  }, []);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});

      setIsPlaying(true);
      setIsVideoPlaying(true);

      showCenterIcon("play");
    } else {
      videoRef.current.pause();

      setIsPlaying(false);
      setIsVideoPlaying(false);

      showCenterIcon("pause");
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();

    if (!videoRef.current) return;

    const nextMuted = !videoRef.current.muted;

    videoRef.current.muted = nextMuted;

    setIsMuted(nextMuted);
  };

  const handleExpand = (e) => {
    e.stopPropagation();

    if (!videoRef.current) {
      onImageClick?.();
      return;
    }

    const currentTime = videoRef.current.currentTime;
    videoRef.current.pause();
    setIsPlaying(false);

    onImageClick?.({ currentTime, isVideo: true });
  };

  if (isMultipleImages) {
    return (
      <div className={cn("overflow-hidden rounded-lg", className)}>
        <MediaCarousel images={media} onImageClick={onImageClick} />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div
        className={cn("relative group overflow-hidden rounded-lg", className)}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleTogglePlay}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleTogglePlay();
            }
          }}
          className="relative block h-full w-full cursor-pointer"
          aria-label={isPlaying ? "Pause reel" : "Play reel"}
        >
          <video
            ref={videoRef}
            className={cn(
              "w-full aspect-square object-cover transition-opacity duration-300",
              isMediaReady ? "opacity-100" : "opacity-0",
            )}
            src={firstMedia}
            poster={videoPoster || undefined}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onLoadedData={() => setIsMediaReady(true)}
            onError={() => setIsMediaReady(true)}
          />

          {/* CENTER PLAY/PAUSE OVERLAY */}
          {centerIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 rounded-full p-4 animate-in fade-in zoom-in-95 duration-150">
                {centerIcon === "play" ? (
                  <Pause size={26} className="text-white fill-white" />
                ) : (
                  <Play size={26} className="text-white fill-white" />
                )}
              </div>
            </div>
          )}

          {/* MUTE / UNMUTE */}
          <button
            onClick={handleToggleMute}
            className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* EXPAND */}
          {onImageClick && (
            <button
              onClick={handleExpand}
              className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full text-white"
            >
              <Expand size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isSingleImage) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)}>
        <div className="w-full aspect-square overflow-hidden rounded-lg">
          <img
            onClick={onImageClick}
            className={cn(
              "w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition",

              isMediaReady ? "opacity-100" : "opacity-0",
            )}
            src={firstMedia}
            alt="post"
            onLoad={() => setIsMediaReady(true)}
            onError={() => setIsMediaReady(true)}
          />
        </div>

        {!isMediaReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="h-8 w-8 border-4 border-white/30 border-t-white animate-spin rounded-full" />
          </div>
        )}
      </div>
    );
  }

  return null;
}

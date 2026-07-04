import { useEffect, useRef, useState } from "react";

import { Expand } from "lucide-react";

import { cn } from "@/lib/utils";

import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";

import { MediaCarousel } from "../Carousel/MediaCarousel";

export function PostImageWithLikes({ post, onImageClick, className }) {
  const videoRef = useRef(null);

  const [isMediaReady, setIsMediaReady] = useState(false);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const [isPlaying, setIsPlaying] = useState(true);

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
  }, [post?.image]);

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;

    const video = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (isVideoPlaying) {
            video.play().catch(() => {});
          }
        } else {
          video.pause();
        }
      },

      {
        threshold: 0.5,
      },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [isVideo, isVideoPlaying]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});

      setIsPlaying(true);
    } else {
      videoRef.current.pause();

      setIsPlaying(false);
    }
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
            playsInline
            preload="metadata"
            onLoadedData={() => setIsMediaReady(true)}
            onError={() => setIsMediaReady(true)}
          />

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

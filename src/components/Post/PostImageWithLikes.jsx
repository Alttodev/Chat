import { useEffect, useRef, useState } from "react";
import { Expand, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";
import { MediaCarousel } from "../Carousel/MediaCarousel";

export function PostImageWithLikes({ post, onImageClick, className }) {
  const videoRef = useRef(null);

  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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
    setIsMuted(true);
  }, [post?.image]);

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;

    if (isVideoPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVideo, isVideoPlaying]);

  const handleVideoToggle = (e) => {
    e.stopPropagation();
    setIsVideoPlaying((p) => !p);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setIsMuted((p) => !p);
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
          onClick={handleVideoToggle}
          className="relative block w-full cursor-pointer overflow-hidden rounded-lg bg-black"
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
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setIsMediaReady(true)}
            onError={() => setIsMediaReady(true)}
          />

          {/* PLAY / PAUSE OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-black/60 text-white">
              {isVideoPlaying ? <Pause /> : <Play />}
            </div>
          </div>

          {/* MUTE */}
          <button
            onClick={handleMuteToggle}
            className="absolute top-3 right-3 bg-black/60 p-1 rounded-full text-white cursor-pointer"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* EXPAND */}
          {onImageClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageClick();
              }}
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

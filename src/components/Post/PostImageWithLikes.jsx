import { useEffect, useRef, useState } from "react";
import { Expand, Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";

const getUserId = (user) => user?._id || user?.id || user?.userId;

export function PostImageWithLikes({
  post,
  onImageClick,
  className,
  likedUsers,
}) {
  const navigate = useNavigate();
  const { profileId, user } = useAuthStore();
  const likeCount = typeof post?.likes === "number" ? post.likes : 0;
  const currentUserId = profileId || user?._id;
  const visibleLiker = likedUsers?.find(
    (likedUser) => String(getUserId(likedUser)) !== String(currentUserId),
  );
  const hasLiked = visibleLiker?.profileImage;
  const videoRef = useRef(null);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const isVideo = isVideoMediaUrl(post?.image || "");
  const videoPoster = getVideoPosterUrl(post?.image || "");

  const canOpenLikes = Boolean(post?._id);

  const handleOpenLikes = (event) => {
    event.stopPropagation();

    if (!canOpenLikes) {
      return;
    }

    navigate(`/posts/${post._id}/liked-users`);
  };

  useEffect(() => {
    setIsMediaReady(false);
    setIsVideoPlaying(true);
    setIsMuted(true);
  }, [post?.image]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    if (isVideoPlaying) {
      videoRef.current.play().catch(() => {});
      return;
    }

    videoRef.current.pause();
  }, [isVideo, isVideoPlaying, post?.image]);

  const handleVideoToggle = (event) => {
    event.stopPropagation();
    setIsVideoPlaying((prev) => !prev);
  };

  const handleMuteToggle = (event) => {
    event.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  if (!post?.image) {
    return null;
  }

  return (
    <div className={cn("relative group overflow-hidden rounded-lg", className)}>
      {isVideo ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleVideoToggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleVideoToggle(event);
            }
          }}
          className="relative block w-full cursor-pointer overflow-hidden rounded-lg bg-black"
          aria-label={isVideoPlaying ? "Pause video" : "Play video"}
        >
          <video
            ref={videoRef}
            className={cn(
              "w-full h-auto object-cover rounded-lg transition-transform duration-300",
              isMediaReady ? "opacity-100" : "opacity-0",
            )}
            src={post.image}
            poster={videoPoster || undefined}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setIsMediaReady(true)}
            onError={() => setIsMediaReady(true)}
          />

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-200",
              isVideoPlaying
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100",
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
              {isVideoPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 fill-current" />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleMuteToggle}
            className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white backdrop-blur-sm transition hover:bg-black/75"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          {onImageClick ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onImageClick();
              }}
              className="absolute right-3 bottom-3 rounded-full bg-black/55 p-2 text-white backdrop-blur-sm transition hover:bg-black/75 cursor-pointer"
              aria-label="Open full screen"
            >
              <Expand className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : (
        <img
          onClick={onImageClick}
          className={cn(
            "w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-[1.01] transition-transform duration-300",
            isMediaReady ? "opacity-100" : "opacity-0",
          )}
          src={post.image}
          alt="post"
          onLoad={() => setIsMediaReady(true)}
          onError={() => setIsMediaReady(true)}
        />
      )}

      {!isMediaReady ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      ) : null}

      {likeCount > 0 && visibleLiker && (
        <>
          <Avatar
            onClick={handleOpenLikes}
            className="absolute left-3 bottom-3 z-10 w-13 h-13 text-emerald-600 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:scale-[1.03] like-fly cursor-pointer"
          >
            <AvatarImage
              className="absolute inset-0 w-full h-full object-cover object-top cursor-pointer"
              src={hasLiked || "/placeholder.svg"}
            />

            <AvatarFallback className="absolute inset-0 z-10 flex items-center justify-center">
              {post?.user?.userName?.charAt(0).toUpperCase() || "-"}
            </AvatarFallback>

            <Heart
              className="absolute bottom-1 right-1 z-20 h-4 w-4"
              style={{
                fill: "#10b981",
                stroke: "#10b981",
              }}
            />
          </Avatar>
        </>
      )}
    </div>
  );
}

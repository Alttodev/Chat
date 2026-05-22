import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getVideoPosterUrl, isVideoMediaUrl } from "@/lib/media";
import { useFriendsList } from "@/hooks/postHooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuthStore } from "@/store/authStore";

export function PostImageWithLikes({
  post,
  onImageClick,
  className,
  likedUsers,
}) {
  const { data: friendsList } = useFriendsList();
  const { profileId } = useAuthStore();

  const friendData = useMemo(() => friendsList, [friendsList]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const friends =
    friendData?.friends?.filter((item) => item?.isFriends === true) || [];

  const friendIds = useMemo(() => {
    return new Set(
      friends.flatMap((item) =>
        [item?.from?._id, item?.to?._id].filter(Boolean).map(String),
      ),
    );
  }, [friends]);

  const likedFriendUsers = useMemo(() => {
    return [...(likedUsers || [])]
      .filter((user) => {
        const likedUserId = String(user?.id || user?.userId);

        return friendIds.has(likedUserId) && likedUserId !== String(profileId);
      })
      .sort(
        (a, b) =>
          new Date(b?.likedAt || 0).getTime() -
          new Date(a?.likedAt || 0).getTime(),
      );
  }, [likedUsers, friendIds, profileId]);

  const likedFriendName = likedFriendUsers?.[0]?.userName;
  const likedFriendImage = likedFriendUsers?.[0]?.profileImage;
  const likeCount = typeof post?.likes === "number" ? post.likes : 0;

  const videoRef = useRef(null);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const isVideo = isVideoMediaUrl(post?.image || "");
  const videoPoster = getVideoPosterUrl(post?.image || "");

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

      {likeCount > 0 && likedFriendImage && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute left-3 bottom-3 z-10 rounded-full"
              aria-label={`${likedFriendName} liked this`}
            >
              <Avatar className="w-10 h-10 text-emerald-600 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:scale-[1.03] ring-2 ring-white/80 dark:ring-white/10 cursor-pointer like-fly">
                <AvatarImage
                  className="w-full h-full object-cover object-top cursor-pointer"
                  src={likedFriendImage || "/placeholder.svg"}
                />

                <AvatarFallback className="flex items-center justify-center bg-white text-foreground dark:bg-zinc-900 dark:text-white">
                  {likedFriendName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>

                <Heart className="absolute bottom-1 right-1 z-20 h-4 w-4 fill-current text-red-500" />
              </Avatar>
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="center"
            sideOffset={10}
            className="
    w-56
    border
    border-slate-200
    bg-white
    px-3
    py-2
    text-slate-800
    shadow-xl
    dark:border-white/10
    dark:bg-zinc-950
    dark:text-white
  "
          >
            <div className="flex items-start gap-2 min-w-0">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={likedFriendImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-white">
                  {likedFriendName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>

              <p className="min-w-0 flex-1 break-words text-xs font-medium leading-5">
                <span className="font-semibold break-all">
                  {likedFriendName}
                </span>{" "}
                liked this post
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

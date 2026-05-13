import { useEffect, useRef, useState } from "react";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVideoPosterUrl } from "@/lib/media";
import { usePostLike } from "@/hooks/postHooks";
import { toastError } from "@/lib/toast";

function ActionButton({ icon, label, active = false, onClick }) {
  const Icon = icon;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className="flex flex-col items-center gap-1 text-white/95 transition hover:scale-105 cursor-pointer"
      aria-label={label}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm ring-1 ring-white/10">
        <Icon
          className={cn(
            "h-5 w-5",
            active ? "fill-current text-emerald-500" : "text-white",
          )}
        />
      </span>
    </button>
  );
}

export function ReelCard({ post, isActive, onComment, onShare }) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const [showCaption, setShowCaption] = useState(true);
  const { mutateAsync: postLike } = usePostLike();
  const [isLiked, setIsLiked] = useState(!!post?.likedByMe);
  const [likeCount, setLikeCount] = useState(
    typeof post?.likes === "number" ? post.likes : 0,
  );

  const userInfo = post?.user || {};
  const videoPoster = getVideoPosterUrl(post?.image || "");
  const commentCount = post?.commentCount || post?.commentsCount || 0;

  useEffect(() => {
    setIsPlaying(true);

    setIsReady(false);
    setShowCaption(true);
    setIsLiked(!!post?.likedByMe);
    setLikeCount(typeof post?.likes === "number" ? post.likes : 0);
  }, [post?._id, post?.image, post?.likedByMe, post?.likes]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!isActive) {
      videoRef.current.pause();
      return;
    }

    if (isPlaying) {
      videoRef.current.play().catch(() => {});
      return;
    }

    videoRef.current.pause();
  }, [isActive, isPlaying, post?.image]);

  useEffect(() => {
    if (!isActive) {
      setShowCaption(true);
    }
  }, [isActive]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    setShowCaption(false);
  };

  const handleLike = async (event) => {
    event.stopPropagation();

    const nextLiked = !isLiked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));

    setIsLiked(nextLiked);
    setLikeCount(nextLikeCount);

    try {
      await postLike(post._id);
    } catch (error) {
      setIsLiked(!nextLiked);
      setLikeCount(likeCount);
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowCaption(true);
  };

  return (
    <section className="relative h-[calc(100vh-9.5rem)] min-h-[32rem] w-full overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:h-[calc(100vh-8.5rem)]">
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
            "h-full w-full object-cover transition-opacity duration-300",
            isReady ? "opacity-100" : "opacity-0",
          )}
          src={post?.image}
          poster={videoPoster || undefined}
          autoPlay
          // muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsReady(true)}
          onError={() => setIsReady(true)}
          onEnded={handleVideoEnded}
        />

        {!isReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div className="max-w-[72%] space-y-3 text-left text-white sm:max-w-[65%]">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-white/20">
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={userInfo?.profileImage || "/placeholder.svg"}
                    alt={userInfo?.userName || "user"}
                  />
                  <AvatarFallback>
                    {userInfo?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">
                      {userInfo?.userName || "User"}
                    </span>
                  </div>
                  {post?.caption ? (
                    <p
                      className={cn(
                        "mt-1 line-clamp-3 text-sm leading-relaxed text-white/85 transition-opacity duration-200",
                        showCaption ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {post.caption}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/70">
                <span>{likeCount} likes</span>
                <span>{"•"}</span>
                <span>{commentCount} comments</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pb-1">
              <ActionButton
                icon={Heart}
                label="Like reel"
                active={isLiked}
                onClick={handleLike}
              />
              <ActionButton
                icon={MessageCircle}
                label="Comment on reel"
                onClick={onComment}
              />
              <ActionButton icon={Send} label="Share reel" onClick={onShare} />
              {/* <ActionButton
                icon={Bookmark}
                label="Save reel"
                onClick={() => {}}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReelCard;

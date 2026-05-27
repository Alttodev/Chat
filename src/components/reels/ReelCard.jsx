import { useEffect, useRef, useState } from "react";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVideoPosterUrl } from "@/lib/media";
import { usePostBookmark, usePostLike } from "@/hooks/postHooks";
import { toastError } from "@/lib/toast";

function ActionButton({
  icon,
  label,
  active = false,
  onClick,
  activeClassName = "fill-current text-red-500",
}) {
  const Icon = icon;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className="flex cursor-pointer flex-col items-center gap-1 text-white/95 transition hover:scale-105"
      aria-label={label}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm ring-1 ring-white/10 sm:h-11 sm:w-11">
        <Icon
          className={cn(
            "h-5 w-5",
            active ? activeClassName : "text-white",
          )}
        />
      </span>
    </button>
  );
}

export function ReelCard({ post, isActive, onLikes, onComment, onShare }) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const { mutateAsync: postLike } = usePostLike();
  const { mutateAsync: postBookmark } = usePostBookmark();
  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(post?.bookmarkedByMe),
  );
  const [isLiked, setIsLiked] = useState(
    !!post?.likedByMe && post?.myReaction === "love",
  );
  const [likeCount, setLikeCount] = useState(
    typeof post?.likes === "number" ? post.likes : 0,
  );

  const userInfo = post?.user || {};

  const videoPoster = getVideoPosterUrl(post?.image || "");
  const commentCount =
    post?.commentCount ||
    post?.commentsCount ||
    post?.totalComments ||
    post?.comments?.length ||
    0;

  useEffect(() => {
    setIsPlaying(true);
    setIsReady(false);
    setIsLiked(!!post?.likedByMe);
    setLikeCount(typeof post?.likes === "number" ? post.likes : 0);
    setIsBookmarked(Boolean(post?.bookmarkedByMe));
  }, [post?._id, post?.image, post?.bookmarkedByMe, post?.likedByMe, post?.likes]);

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

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleLike = async (event) => {
    event.stopPropagation();

    const nextLiked = !isLiked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
    const nextReaction = nextLiked ? "love" : null;

    setIsLiked(nextLiked);
    setLikeCount(nextLikeCount);

    try {
      await postLike({
        id: post._id,
        type: nextReaction,
      });
    } catch (error) {
      setIsLiked(!nextLiked);
      setLikeCount(likeCount);
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleBookmark = async (event) => {
    event.stopPropagation();

    if (!post?._id) return;

    const previousBookmarked = isBookmarked;
    const nextBookmarked = !previousBookmarked;

    setIsBookmarked(nextBookmarked);

    try {
      const res = await postBookmark({
        id: post._id,
      });

      setIsBookmarked(
        typeof res?.bookmarkedByMe === "boolean"
          ? res.bookmarkedByMe
          : typeof res?.data?.bookmarkedByMe === "boolean"
            ? res.data.bookmarkedByMe
            : nextBookmarked,
      );
    } catch (error) {
      setIsBookmarked(previousBookmarked);
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <section className="relative h-[calc(100dvh-13rem)] min-h-[26rem] w-full overflow-hidden rounded-[18px] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:h-[calc(100vh-8.5rem)] sm:min-h-[32rem]">
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

        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/10"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-none space-y-2 pr-20 text-left text-white sm:max-w-[65%] sm:space-y-3 sm:pr-0">
              <div className="flex items-start gap-3 sm:items-center">
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold sm:text-base">
                      {userInfo?.userName || "User"}
                    </span>
                  </div>
                  {post?.postText ? (
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-xs leading-relaxed text-white/85 transition-opacity duration-200 sm:line-clamp-3 sm:text-sm",
                      "opacity-100",
                    )}
                  >
                    {post.postText}
                  </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/75 sm:text-xs">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onLikes?.(post);
                  }}
                  className="rounded-full transition cursor-pointer"
                  aria-label="View reel likes"
                >
                  {likeCount} {likeCount === 1 ? "like" : "likes"}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onComment?.(post);
                  }}
                  className="rounded-full transition  cursor-pointer"
                  aria-label="View reel comments"
                >
                  {commentCount} {commentCount === 1 ? "comment" : "comments"}
                </button>
              </div>
            </div>

            <div className="absolute bottom-8 right-3 z-20 flex flex-col items-center gap-3 sm:static sm:bottom-auto sm:right-auto sm:gap-4">
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
              <ActionButton
                icon={Bookmark}
                label={isBookmarked ? "Remove bookmark" : "Save reel"}
                active={isBookmarked}
                activeClassName="fill-current text-amber-400"
                onClick={handleBookmark}
              />
              <ActionButton icon={Send} label="Share reel" onClick={onShare} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReelCard;

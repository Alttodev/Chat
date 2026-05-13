import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostList } from "@/hooks/postHooks";
import { isVideoMediaUrl } from "@/lib/media";
import ReelCard from "./ReelCard";
import { useZustandSharePopup } from "@/lib/zustand";
import { useNavigate } from "react-router-dom";
import { toastError } from "@/lib/toast";
import { usePostLike } from "@/hooks/postHooks";

export function ReelsFeed() {
  const navigate = useNavigate();
  const { openShareModal } = useZustandSharePopup();
  const { mutateAsync: postLike } = usePostLike();
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    usePostList();
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const posts = useMemo(
    () => data?.pages?.flatMap((page) => page.posts) || [],
    [data],
  );

  const reels = useMemo(
    () =>
      posts.filter((post) => isVideoMediaUrl(post?.image || "", post?.mimeType || post?.mimetype || "")),
    [posts],
  );

  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!Number.isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      { root: scrollRef.current, threshold: 0.75 },
    );

    itemRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    if (hasNextPage && reels.length > 0 && activeIndex >= reels.length - 2) {
      fetchNextPage().catch(() => {});
    }
  }, [activeIndex, fetchNextPage, hasNextPage, reels.length]);

  const scrollToIndex = (nextIndex) => {
    const target = itemRefs.current[nextIndex];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLike = async (post) => {
    try {
      await postLike(post._id);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Loading reels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
            <Clapperboard className="h-4 w-4" />
            Reels
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Discover short video stories
          </h1>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(activeIndex - 1, 0))}
            className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:border-emerald-200 hover:text-emerald-600"
            aria-label="Previous reel"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(activeIndex + 1, reels.length - 1))}
            className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:border-emerald-200 hover:text-emerald-600"
            aria-label="Next reel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-950 via-black to-slate-900 p-2 shadow-[0_24px_90px_rgba(15,23,42,0.3)] sm:p-3">
        <div
          ref={scrollRef}
          className={cn(
            "no-scrollbar h-[calc(100vh-14rem)] overflow-y-auto scroll-smooth snap-y snap-mandatory",
            "sm:h-[calc(100vh-13rem)]",
          )}
        >
          {reels.map((post, index) => (
            <div
              key={post?._id || `reel-${index}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-index={index}
              className="snap-start px-0 py-2 sm:px-10 sm:py-3"
            >
              <ReelCard
                post={post}
                index={index}
                isActive={index === activeIndex}
                onLike={() => handleLike(post)}
                onComment={() => navigate(`/home?postId=${post._id}`)}
                onShare={() => openShareModal(post?._id)}
              />
            </div>
          ))}

          {!reels.length ? (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/10 bg-white/5 text-center text-white/80">
              <Sparkles className="h-10 w-10 text-emerald-400" />
              <div>
                <p className="text-lg font-semibold text-white">No reels yet</p>
                <p className="mt-1 text-sm text-white/65">
                  Video posts will appear here once they are uploaded.
                </p>
              </div>
            </div>
          ) : null}

          {isFetchingNextPage ? (
            <div className="flex justify-center py-5 text-white/70">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ReelsFeed;

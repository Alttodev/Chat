import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePostListVideos } from "@/hooks/postHooks";
import { isVideoMediaUrl } from "@/lib/media";
import ReelCard from "./ReelCard";
import { useZustandSharePopup } from "@/lib/zustand";
import { ReelCommentsDialog } from "./ReelCommentsDialog";
import { Spinner } from "../ui/shadcn-io/spinner";
import { PostSkeleton } from "../skeleton/postListSkeleton";

export function ReelsFeed() {
  const navigate = useNavigate();
  const { openShareModal } = useZustandSharePopup();
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    usePostListVideos();
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCommentPost, setSelectedCommentPost] = useState(null);

  const posts = useMemo(
    () => data?.pages?.flatMap((page) => page.posts) || [],
    [data],
  );

  const reels = useMemo(
    () =>
      posts.filter((post) => {
        const mediaUrl = Array.isArray(post?.image)
          ? post.image[0]
          : post?.image;

        return isVideoMediaUrl(
          mediaUrl || "",
          post?.mimeType || post?.mimetype || "",
        );
      }),
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

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner className="text-emerald-600" size={44} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between px-1 ">
        <div>
          <p className="inline-flex items-center gap-2 text-xl font-semibold uppercase tracking-[0.22em] text-emerald-600">
            <Clapperboard className="h-6 w-6" />
            Reels
          </p>
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
            onClick={() =>
              scrollToIndex(Math.min(activeIndex + 1, reels.length - 1))
            }
            className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:border-emerald-200 hover:text-emerald-600"
            aria-label="Next reel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-[12px] overflow-hidden border border-white/10 bg-gradient-to-b from-slate-950 via-black to-slate-900 shadow-[0_24px_90px_rgba(15,23,42,0.3)]">
        <div
          ref={scrollRef}
          className="no-scrollbar h-[100dvh] overflow-y-auto snap-y snap-mandatory"
        >
          {reels.map((post, index) => (
            <div
              key={post?._id || `reel-${index}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-index={index}
              className="snap-start h-[100dvh]"
            >
              <ReelCard
                post={post}
                index={index}
                isActive={index === activeIndex}
                onLikes={(selectedPost) =>
                  navigate(`/posts/${selectedPost?._id}/liked-users`)
                }
                onComment={() => setSelectedCommentPost(post)}
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
              <PostSkeleton />
            </div>
          ) : null}

          {!hasNextPage && reels.length > 0 && (
            <div className="snap-start h-[100dvh] flex items-center justify-center">
              <div className="text-center text-white">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                <h3 className="text-lg font-semibold">No more reels</h3>
                <p className="text-sm text-white/60">You've reached the end.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReelCommentsDialog
        post={selectedCommentPost}
        open={Boolean(selectedCommentPost)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCommentPost(null);
          }
        }}
      />
    </div>
  );
}

export default ReelsFeed;

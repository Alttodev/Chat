import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
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
      <div className="overflow-hidden  ">
        <div
          ref={scrollRef}
          className="no-scrollbar h-[100dvh] overflow-y-auto snap-y snap-mandatory overscroll-y-contain scroll-smooth"
        >
          {reels.map((post, index) => (
            <div
              key={post?._id || `reel-${index}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-index={index}
             className="snap-start h-full"
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
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-border bg-background text-center">
              <Sparkles className="h-10 w-10 text-emerald-400" />

              <div>
                <p className="text-lg font-semibold text-black dark:text-white">
                  No reels yet
                </p>

                <p className="mt-1 text-sm text-gray-600 dark:text-white/65">
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
              <div className="text-center">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-emerald-400" />

                <h3 className="text-lg font-semibold text-foreground">
                  No more reels
                </h3>

                <p className="text-sm text-muted-foreground">
                  You've reached the end.
                </p>
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

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useCommentStore,
  useImageModalStore,
  useZustandSharePopup,
  useUserPostStore,
} from "@/lib/zustand";
import { formatRelative } from "@/lib/dateHelpers";
import { formatShortUsername } from "@/lib/shortUserName";
import PostLikeComponent from "@/components/Post/PostLike";
import { CommentSection } from "@/components/Post/CommentSection";
import { PostImageWithLikes } from "@/components/Post/PostImageWithLikes";
import PostContent from "@/components/Post/PostContent";
import PostBookmarkComponent from "@/components/Post/PostBookmark";
import { ImageViewer } from "@/components/modals/imageViewer";
import { ShareDialog } from "@/components/modals/shareModal";
import { formatCount } from "@/lib/formatCount";

export default function UserPostFeed() {
  const { posts, userInfo, currentUser } = useUserPostStore();

  const { openPostId, toggleComments} = useCommentStore();
  const { open } = useImageModalStore();
  const { openShareModal } = useZustandSharePopup();

  const { postId } = useParams();
  const targetPostId = postId;
  const firstPostRef = useRef(null);
  const [localPosts, setLocalPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});

  useEffect(() => {
    if (!targetPostId) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [targetPostId]);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const user = userInfo;
  const currentUserId = user?._id ? String(user._id) : null;
  const displayPosts = useMemo(() => {
    if (!targetPostId) return localPosts;

    const startIndex = localPosts.findIndex(
      (post) => post._id === targetPostId,
    );
    return startIndex >= 0 ? localPosts.slice(startIndex) : localPosts;
  }, [localPosts, targetPostId]);

  const handleLikeChange = (postId, updated) => {
    const patchPost = (post) => {
      if (post._id !== postId) return post;

      return {
        ...post,
        likedBy: Array.isArray(updated?.likedBy)
          ? updated.likedBy
          : post.likedBy,
        likes: typeof updated?.likes === "number" ? updated.likes : post.likes,
        myReaction:
          typeof updated?.myReaction !== "undefined"
            ? updated.myReaction
            : post.myReaction,
        likedByMe: Boolean(updated?.likedByMe ?? updated?.myReaction),
      };
    };

    setLocalPosts((prev) => prev.map(patchPost));
  };

  const getInitialCommentCount = (post) =>
    post?.commentCount ??
    post?.commentsCount ??
    post?.totalComments ??
    post?.comments?.length ??
    0;

  const handleCommentCountChange = (postId, delta) => {
    if (!postId || !delta) return;

    setCommentCounts((prev) => {
      const currentPost = displayPosts.find((post) => post._id === postId);
      const currentCount =
        prev[postId] ?? getInitialCommentCount(currentPost) ?? 0;

      return {
        ...prev,
        [postId]: Math.max(0, currentCount + delta),
      };
    });
  };

  if (!posts.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-20">
      <div className="space-y-4 pt-4 px-2">
        {displayPosts.map((post, i) => {
          const likeCount = typeof post?.likes === "number" ? post.likes : 0;
          const commentCount =
            commentCounts[post._id] ?? getInitialCommentCount(post);
          const likedByUsers = Array.isArray(post?.likedByUsers)
            ? post.likedByUsers
            : [];
          const visibleLiker = likedByUsers.find((u) => {
            const likerId = String(u?._id ?? u?.id ?? u?.userId ?? "");
            return likerId && likerId !== currentUserId;
          });

          return (
            <Card
              key={post._id}
              id={`post-${post._id}`}
              ref={i === 0 ? firstPostRef : null}
              className="overflow-hidden scroll-mt-28"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 text-emerald-600">
                    <AvatarImage
                      onClick={() => open(user?.profileImage)}
                      className="h-full w-full cursor-pointer object-cover object-top"
                      src={user?.profileImage || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {user?.userName?.charAt(0).toUpperCase() || "-"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium sm:text-base">
                      {user?.userName}
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {formatRelative(post?.createdAt)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <PostImageWithLikes
                  likedUsers={post?.likedByUsers}
                  post={post}
                  onImageClick={() => open(post.image)}
                />

                <PostContent text={post?.postText} className="mt-3 pl-2" />

                <div className="mt-3 flex items-center gap-1">
                  <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                    <PostLikeComponent
                      post={post}
                      currentUserId={currentUser?.id}
                      onLikeChange={handleLikeChange}
                    />
                    {likeCount === 0 ? null : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatCount(likeCount)}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComments(post?._id)}
                        className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
                        aria-label="Comment on post"
                      >
                        <MessageCircle style={{ width: 18, height: 18 }} />
                      </Button>
                      {commentCount > 0 && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatCount(commentCount)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openShareModal(post?._id)}
                      className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
                      aria-label="Share post"
                    >
                      <Send style={{ width: 18, height: 18 }} />
                    </Button>
                  </div>
                  <PostBookmarkComponent
                    post={post}
                    className="ml-auto shrink-0"
                  />
                </div>

                {likeCount > 0 && visibleLiker && (
                  <Link
                    to={`/posts/${post._id}/liked-users`}
                    className="inline-flex ml-2 max-w-[180px] items-center truncate text-[13px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {likeCount === 1
                      ? `Liked by ${formatShortUsername(visibleLiker?.userName)}`
                      : `Liked by ${formatShortUsername(visibleLiker?.userName)} and others`}
                  </Link>
                )}

                {openPostId === post._id && (
                  <div className="mt-3">
                    <CommentSection
                      postId={post._id}
                      userProfile={currentUser}
                      onCommentAdded={() =>
                        handleCommentCountChange(post._id, 1)
                      }
                      onCommentRemoved={() =>
                        handleCommentCountChange(post._id, -1)
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ImageViewer />
      <ShareDialog />
    </div>
  );
}

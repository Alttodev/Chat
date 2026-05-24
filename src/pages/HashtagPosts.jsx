import {
    BadgeCheck,
  MessageCircle,
  MoreHorizontal,
  Send,
  SquarePen,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";

import {
  useCommentStore,
  useImageModalStore,
  useZustandPopup,
  useZustandSharePopup,
} from "@/lib/zustand";

import { formatRelative } from "@/lib/dateHelpers";
import { ShareDialog } from "@/components/modals/shareModal";
import PostLikeComponent from "@/components/Post/PostLike";
import { CommentSection } from "@/components/Post/CommentSection";
import { ImageViewer } from "@/components/modals/imageViewer";
import { PostImageWithLikes } from "@/components/Post/PostImageWithLikes";
import PostContent from "@/components/Post/PostContent";
import { PostSkeleton } from "@/components/skeleton/postListSkeleton";
import { useHashtagPosts, usePostDelete } from "@/hooks/postHooks";
import { usePostInfo } from "@/hooks/postHooks";
import { useScrollToPost } from "@/hooks/useScrollToPost";
import { formatShortUsername } from "@/lib/shortUserName";
import { useUserDetail } from "@/hooks/authHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostDialog } from "@/components/modals/postModal";

const HashtagPosts = () => {
  const { tag } = useParams();
  const { openShareModal } = useZustandSharePopup();
  const { openModal } = useZustandPopup();
  const { data: profileData } = useUserDetail();
  const { mutateAsync: deletePost } = usePostDelete();
  const { openPostId, toggleComments, setOpenPostId } = useCommentStore();
  const { open } = useImageModalStore();
  const loadMoreRef = useRef(null);

  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("postId");
  const targetCommentId = searchParams.get("commentId");

  const userProfile = useMemo(() => profileData, [profileData]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useHashtagPosts(tag);

  const posts = useMemo(() => data?.posts || [], [data]);

  const [localPosts, setLocalPosts] = useState([]);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const { data: targetPostData } = usePostInfo(targetPostId);
  const targetPost = targetPostData?.post;

  const displayPosts = useMemo(() => {
    if (!targetPostId || !targetPost) return localPosts;
    if (localPosts.some((post) => post._id === targetPostId)) return localPosts;
    return [targetPost, ...localPosts];
  }, [localPosts, targetPost, targetPostId]);

  useScrollToPost(targetPostId, [displayPosts]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (targetPostId) {
      setOpenPostId(targetPostId);
    }
  }, [setOpenPostId, targetPostId]);

  const handleDelete = async (id) => {
    try {
      const res = await deletePost(id);
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex min-h-90 items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-20">
      <div
        className="
    sticky top-0 z-20
    border-border/60
    bg-background/90
    px-1 
    backdrop-blur-md
  "
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="
            rounded-full
            bg-blue-100
            px-2 py-0.5
            text-xs font-semibold
            text-blue-700
            dark:bg-blue-950/40
            dark:text-blue-300
          "
              >
                HASHTAG
              </span>

              <h1
                className="
            truncate
            text-lg font-bold
            text-foreground
            sm:text-xl
          "
              >
                #{tag}
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {data?.totalPosts || 0} posts related to this hashtag
            </p>
          </div>
        </div>
      </div>

      {displayPosts.length > 0 ? (
        displayPosts.map((post) => {
          const likeCount = typeof post?.likes === "number" ? post.likes : 0;
          const likedByUsers = Array.isArray(post?.likedByUsers)
            ? post.likedByUsers
            : [];
          const visibleLiker = likedByUsers[0];

          return (
            <Card
              key={post._id}
              id={`post-${post._id}`}
              className="overflow-hidden scroll-mt-28"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 text-emerald-600">
                      <AvatarImage
                        onClick={() => open(post?.user?.profileImage)}
                        className="h-full w-full cursor-pointer object-cover object-top"
                        src={post?.user?.profileImage || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {post?.user?.userName?.charAt(0).toUpperCase() || "-"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      {userProfile?.profile?.id === post?.user?._id ? (
                        <div className="flex items-center gap-1">
                          <span className="truncate text-sm font-medium sm:text-base">
                            {post?.user?.userName}
                          </span>
                          {post?.user?.isVerified && (
                            <BadgeCheck className="h-4 w-4 fill-blue-500 text-white flex-shrink-0" />
                          )}
                        </div>
                      ) : (
                        <Link
                          to={`/users/${post?.user?._id}`}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <span className="truncate text-sm font-medium sm:text-base">
                            {post?.user?.userName}
                          </span>
                          {post?.user?.isVerified && (
                            <BadgeCheck className="h-4 w-4 fill-blue-500 text-white flex-shrink-0" />
                          )}
                        </Link>
                      )}

                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatRelative(post?.createdAt)}
                      </p>
                    </div>
                  </div>
                  {post?.isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className="relative cursor-pointer rounded-full border-0 p-1 transition-colors duration-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle user menu</span>
                        </span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="mt-1 w-full border-slate-200 shadow-lg"
                        sideOffset={8}
                      >
                        <DropdownMenuItem
                          className="cursor-pointer transition-colors duration-200"
                          onClick={() =>
                            openModal({ userProfile, postId: post._id })
                          }
                        >
                          <SquarePen className="mr-1 h-4 w-4 text-slate-500 transition-colors duration-200 group-hover:text-emerald-600" />
                          <span className="font-medium text-emerald-700">
                            Edit Post
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="mt-1 cursor-pointer transition-colors duration-200"
                          onClick={() => handleDelete(post._id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4 text-slate-500 transition-colors duration-200" />
                          <span className="font-medium text-red-500">
                            Delete Post
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <PostImageWithLikes
                  post={post}
                  likedUsers={post?.likedByUsers}
                  onImageClick={() => open(post.image)}
                />

                <PostContent text={post?.postText} className="mb-4 mt-3 pl-2" />

                <div className="mt-3 flex flex-wrap items-center gap-1 sm:flex-nowrap">
                  <PostLikeComponent
                    post={post}
                    currentUserId={post?.user?._id}
                    onLikeChange={handleLikeChange}
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post?._id)}
                    className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
                    aria-label="Comment on post"
                  >
                    <MessageCircle style={{ width: 18, height: 18 }} />
                  </Button>

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

                {likeCount > 0 && visibleLiker && (
                  <Link
                    to={`/posts/${post._id}/liked-users`}
                    title={visibleLiker?.userName || ""}
                    className="
                      inline-flex ml-2 max-w-[180px] items-center truncate
                      text-[13px] font-medium
                      text-slate-500
                      transition-colors duration-200
                      hover:text-slate-700
                      dark:text-slate-400
                      dark:hover:text-slate-200
                    "
                  >
                    {likeCount === 1
                      ? `Liked by ${formatShortUsername(visibleLiker?.userName)}`
                      : `Liked by ${formatShortUsername(
                          visibleLiker?.userName,
                        )} and others`}
                  </Link>
                )}

                {openPostId === post._id && (
                  <div className="mt-3">
                    <CommentSection
                      userProfile={userProfile?.profile}
                      postId={post._id}
                      highlightCommentId={
                        targetPostId === post._id ? targetCommentId : undefined
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold text-foreground">
            No posts found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No posts available for #{tag}
          </p>
        </div>
      )}
      <PostDialog />
      <ShareDialog />
      <ImageViewer />

      <div ref={loadMoreRef} style={{ height: "20px" }} />
      {isFetchingNextPage && <PostSkeleton />}
      {!hasNextPage && (
        <div className="flex justify-center">
          <span className="px-3 text-sm text-muted-foreground">
            No more posts
          </span>
        </div>
      )}
    </div>
  );
};

export default HashtagPosts;

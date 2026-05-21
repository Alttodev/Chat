import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash2,
  SquarePen,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDetail } from "@/hooks/authHooks";
import { PostForm } from "./form/PostForm";
import { usePostDelete, usePostList } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { Spinner } from "./ui/shadcn-io/spinner";
import PostLikeComponent from "./Post/PostLike";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toastError, toastSuccess } from "@/lib/toast";
import { PostDialog } from "./modals/postModal";
import {
  useCommentStore,
  useImageModalStore,
  useZustandPopup,
  useZustandSharePopup,
} from "@/lib/zustand";
import { CommentSection } from "./Post/CommentSection";
import { PostImageDialog } from "./modals/postImageModal";
import { ShareDialog } from "./modals/shareModal";
import { PostSkeleton } from "./skeleton/postListSkeleton";
import { Link, useSearchParams } from "react-router-dom";
import { ImageViewer } from "./modals/imageViewer";
import { useScrollToPost } from "@/hooks/useScrollToPost";
import { usePostInfo } from "@/hooks/postHooks";
import { PostImageWithLikes } from "./Post/PostImageWithLikes";
import PostContent from "./Post/PostContent";

export function CenterFeed() {
  const { openModal } = useZustandPopup();
  const { openShareModal } = useZustandSharePopup();
  const { openPostId, toggleComments, setOpenPostId } = useCommentStore();
  const { data: profileData } = useUserDetail();
  const { mutateAsync: deletePost } = usePostDelete();
  const [searchParams] = useSearchParams();

  const userProfile = useMemo(() => profileData, [profileData]);
  const targetPostId = searchParams.get("postId");
  const targetCommentId = searchParams.get("commentId");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePostList();

  const loadMoreRef = useRef(null);
  const { open } = useImageModalStore();

  const basePosts = useMemo(
    () => data?.pages?.flatMap((page) => page.posts) || [],
    [data],
  );

  const { data: targetPostData } = usePostInfo(targetPostId);
  const targetPost = targetPostData?.post;

  const [localPosts, setLocalPosts] = useState([]);
  const [targetPostOverride, setTargetPostOverride] = useState(null);

  useEffect(() => {
    setLocalPosts(basePosts);
  }, [basePosts]);

  useEffect(() => {
    setTargetPostOverride(targetPost || null);
  }, [targetPost]);

  const displayPosts = useMemo(() => {
    if (!targetPostId) return localPosts;

    const hasTargetInList = localPosts.some(
      (post) => post._id === targetPostId,
    );

    if (hasTargetInList) {
      return localPosts.map((post) =>
        post._id === targetPostId && targetPostOverride
          ? { ...post, ...targetPostOverride }
          : post,
      );
    }

    if (targetPostOverride) {
      return [targetPostOverride, ...localPosts];
    }

    return localPosts;
  }, [localPosts, targetPostId, targetPostOverride]);

  useScrollToPost(targetPostId, [displayPosts]);

  useEffect(() => {
    if (targetPostId) {
      setOpenPostId(targetPostId);
    }
  }, [setOpenPostId, targetPostId]);

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
    setTargetPostOverride((prev) => (prev ? patchPost(prev) : prev));
  };

  if (isLoading) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-0 sm:px-4 mt-2 space-y-4 pb-20">
      <Card id="create-post">
        <CardContent className="p-3">
          <PostForm userProfile={userProfile} />
        </CardContent>
      </Card>

      {displayPosts.map((post) => {
        return (
          <Card
            key={post._id}
            id={`post-${post._id}`}
            className="overflow-hidden scroll-mt-28"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="w-10 h-10 text-emerald-600">
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

              <PostContent text={post?.postText} className="mt-3 pl-2" />

              <div className="mt-3 flex items-start  flex-wrap sm:flex-nowrap">
                <PostLikeComponent
                  post={post}
                  currentUserId={userProfile?.profile?.id}
                  onLikeChange={handleLikeChange}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post._id)}
                  className="h-9 w-9 shrink-0 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground "
                  aria-label="Comment on post"
                >
                  <MessageCircle style={{ width: 18, height: 18 }} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openShareModal(post._id)}
                  className="h-9 w-9 shrink-0 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground "
                  aria-label="Share post"
                >
                  <Send style={{ width: 18, height: 18 }} />
                </Button>
              </div>

              {post?.likes > 0 && (
                <Link
                  to={`/posts/${post._id}/liked-users`}
                  className="
      mt-2 ml-2 inline-flex items-center
      text-sm font-medium
      text-slate-700
      transition-colors duration-200
      hover:text-black
      dark:text-slate-300
      dark:hover:text-white
    "
                >
                  {post?.likes === 1 ? "1 like" : `${post?.likes} likes`}
                </Link>
              )}

              {openPostId === post._id && (
                <div className="mt-3">
                  <CommentSection
                    postId={post._id}
                    userProfile={userProfile?.profile}
                    highlightCommentId={
                      targetPostId === post._id ? targetCommentId : undefined
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <PostDialog />
      <PostImageDialog />
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
}

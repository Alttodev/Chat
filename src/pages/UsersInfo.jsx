import { BadgeCheck, Lock, MapPin, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useCommentStore,
  useImageModalStore,
  useZustandSharePopup,
} from "@/lib/zustand";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
  useUserInfoCount,
  useUserPostList,
} from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { ShareDialog } from "@/components/modals/shareModal";
import PostLikeComponent from "@/components/Post/PostLike";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/Post/CommentSection";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { ImageViewer } from "@/components/modals/imageViewer";
import { usePostInfo } from "@/hooks/postHooks";
import { useScrollToPost } from "@/hooks/useScrollToPost";
import { PostImageWithLikes } from "@/components/Post/PostImageWithLikes";
import PostContent from "@/components/Post/PostContent";
import { useMarkProfileViewSeen } from "@/hooks/profileViewHooks";
import { PostSkeleton } from "@/components/skeleton/postListSkeleton";
import { formatShortUsername } from "@/lib/shortUserName";
import PostBookmarkComponent from "@/components/Post/PostBookmark";


const UsersInfo = () => {
  const navigate = useNavigate();
  const { openShareModal } = useZustandSharePopup();
  const { profileId } = useAuthStore();
  const { openPostId, toggleComments, setOpenPostId } = useCommentStore();
  const { mutateAsync: markProfileViewSeen } = useMarkProfileViewSeen();
  const loadMoreRef = useRef(null);
  const params = useParams();
  const id = params?.id;
  const { open } = useImageModalStore();
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("postId");
  const targetCommentId = searchParams.get("commentId");

  const { mutateAsync: followRequest, isPending: isFollowing } =
    useProfileFollow();
  const { mutateAsync: unfollowRequest, isPending: isUnfollowing } =
    useRequestDelete();

  const { data: count } = useUserInfoCount(id);
  const countData = useMemo(() => count, [count]);

  const { data: requestStatus } = useRequestListInfo({
    fromId: profileId,
    toId: id,
  });

  const reqStatus = requestStatus?.request?.status;
  const friends = requestStatus?.request?.isFriends;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUserPostList(id);

  const posts = useMemo(
    () => data?.pages?.flatMap((page) => page.posts) || [],
    [data],
  );

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

  const user = data?.pages?.[0]?.userDetail;
  const currentUser = data?.pages?.[0]?.currentUser;

  const totalPosts = data?.pages?.[0]?.totalPosts;

  useEffect(() => {
    if (id && id !== profileId) {
      markProfileViewSeen(id);
    }
  }, [id, profileId, markProfileViewSeen]);

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

  const handleFollow = async (userId) => {
    try {
      await followRequest(userId);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowRequest({
        fromId: profileId,
        toId: id,
      });
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
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto  space-y-8 pb-20">
      {/* Header */}

      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="pt-5 pb-0 px-4">
          {/* Row 1: Avatar  +  Stats */}
          <div className="flex items-center gap-6 sm:gap-10">
            {/* Avatar with story-ring gradient */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage
                  onClick={() => open(user?.profileImage)}
                  className="w-full h-full object-cover object-top cursor-pointer rounded-full"
                  src={user?.profileImage || "/placeholder.svg"}
                />
                <AvatarFallback className="text-2xl font-semibold text-emerald-700 rounded-full">
                  {user?.userName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>

              {/* Online indicator */}
              <span
                className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 ${
                  user?.isOnline ? "bg-green-500" : "bg-yellow-400"
                }`}
              />
            </div>

            {/* Stats: Posts / Followers / Following */}
            <div className="flex flex-1 justify-around">
              {/* Posts */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-semibold text-foreground leading-none">
                  {totalPosts ?? 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  {totalPosts <= 1 ? "Post" : "Posts"}
                </span>
              </div>

              {/* Followers */}
              <div className="flex flex-col items-center gap-0.5">
                {countData?.totalFriends > 0 ? (
                  <Link
                    to={`/friends/${user?._id}`}
                    className="text-lg font-semibold text-foreground leading-none cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    {countData?.totalFriends}
                  </Link>
                ) : (
                  <span className="text-lg font-semibold text-foreground leading-none">
                    {countData?.totalFriends ?? 0}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {countData?.totalFriends <= 1 ? "Follower" : "Followers"}
                </span>
              </div>

              {/* Following */}
              <div className="flex flex-col items-center gap-0.5">
                {countData?.totalFollowing > 0 ? (
                  <Link
                    to={`/following/${user?._id}`}
                    className="text-lg font-semibold text-foreground leading-none cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    {countData?.totalFollowing}
                  </Link>
                ) : (
                  <span className="text-lg font-semibold text-foreground leading-none">
                    {countData?.totalFollowing ?? 0}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">Following</span>
              </div>
            </div>
          </div>

          {/* Row 2: Username + Bio + Location */}
          <div className="mt-3 space-y-1">
            <div className="text-md pl-1 font-bold text-balance flex items-center gap-1">
              {user?.userName || "-"}
              {user?.isVerified && (
                <BadgeCheck className="w-5 h-5 fill-blue-500 text-white" />
              )}
            </div>

            {user?.address && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{user.address}</span>
              </div>
            )}

            {user?.bio && (
              <p className="text-sm leading-snug text-foreground break-words max-w-sm">
                {user.bio}
              </p>
            )}
          </div>

          {/* Row 3: Action buttons */}
          <div className="mt-3 mb-4 flex items-center gap-2">
            {reqStatus === "pending" ? (
              <Button className="w-28 h-8 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 border border-rose-500/20 cursor-default shadow-none">
                Pending
              </Button>
            ) : profileId !== id ? (
              <>
                <Button
                  onClick={() =>
                    friends ? handleUnfollow() : handleFollow(user?._id)
                  }
                  disabled={isFollowing || isUnfollowing}
                  className={`w-28 h-8 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-none cursor-pointer
          ${
            friends
              ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:border-zinc-700"
              : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
          }
        `}
                >
                  {friends ? "Unfollow" : "Follow"}
                </Button>

                {friends && (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/messages?userId=${id}&name=${user?.userName}`);
                    }}
                    className="w-28 h-8 rounded-lg text-xs font-semibold shadow-none cursor-pointer"
                  >
                    Message
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </CardContent>

        <ImageViewer />
      </Card>

      {user?.isPublic || friends ? (
        <>
          {displayPosts.map((post) => {
            const likeCount = typeof post?.likes === "number" ? post.likes : 0;
            const currentUserId = user?._id ? String(user._id) : null;
            const likedByUsers = Array.isArray(post?.likedByUsers)
              ? post.likedByUsers
              : [];
            const visibleLiker = likedByUsers.find((user) => {
              const likerId = String(
                user?._id ?? user?.id ?? user?.userId ?? "",
              );
              return likerId && likerId !== currentUserId;
            });
            return (
              <Card
                key={post._id}
                id={`post-${post._id}`}
                className="overflow-hidden scroll-mt-28"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
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
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <PostImageWithLikes
                    post={post}
                    likedUsers={post?.likedByUsers}
                    onImageClick={() => open(post.image)}
                  />

                  <PostContent
                    text={post?.postText}
                    className="mt-3 mb-4 pl-2"
                  />

                  <div className="mt-3 flex items-center gap-1">
                    <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                      <PostLikeComponent
                        post={post}
                        currentUserId={currentUser?.id}
                        onLikeChange={handleLikeChange}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComments(post?._id)}
                        className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
                        aria-label="Comment on post"
                      >
                        <MessageCircle
                          style={{
                            width: 18,
                            height: 18,
                          }}
                        />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openShareModal(post?._id)}
                        className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent  hover:text-muted-foreground"
                        aria-label="Share post"
                      >
                        <Send
                          style={{
                            width: 18,
                            height: 18,
                          }}
                        />
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
                        postId={post._id}
                        userProfile={currentUser}
                        highlightCommentId={
                          targetPostId === post._id
                            ? targetCommentId
                            : undefined
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full border-2 border-slate-300 dark:border-zinc-700">
            <Lock className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-semibold">This Account is Private</h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Follow this account to see their photos, videos, and activity.
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersInfo;

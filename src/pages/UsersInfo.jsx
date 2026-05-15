import {
  BadgeCheck,
  ImageIcon,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useCommentStore,
  useImageModalStore,
  useZustandSharePopup,
} from "@/lib/zustand";
import { useEffect, useMemo, useRef } from "react";
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
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { ImageViewer } from "@/components/modals/imageViewer";
import { usePostInfo } from "@/hooks/postHooks";
import { useScrollToPost } from "@/hooks/useScrollToPost";
import { PostImageWithLikes } from "@/components/Post/PostImageWithLikes";
import PostContent from "@/components/Post/PostContent";
import { useMarkProfileViewSeen } from "@/hooks/profileViewHooks";
import { PostSkeleton } from "@/components/skeleton/postListSkeleton";

const UsersInfo = () => {
  // const navigate = useNavigate();
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
  const { data: targetPostData } = usePostInfo(targetPostId);
  const targetPost = targetPostData?.post;
  const displayPosts = useMemo(() => {
    if (!targetPostId || !targetPost) return posts;
    if (posts.some((post) => post._id === targetPostId)) return posts;
    return [targetPost, ...posts];
  }, [posts, targetPost, targetPostId]);
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
      // toastSuccess(res?.message);
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
      // toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-8 pb-20">
      {/* Header */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-3">
          <div className="flex justify-between flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  onClick={() => open(user?.profileImage)}
                  className="w-full h-full object-cover object-top cursor-pointer"
                  src={user?.profileImage || "/placeholder.svg"}
                />
                <AvatarFallback className="text-2xl font-semibold  text-emerald-700">
                  {user?.userName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>
              <ImageViewer />
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-xl font-bold text-balance flex items-center gap-1">
                    {user?.userName || "-"}
                    {user?.isVerified && (
                      <BadgeCheck className="w-5 h-5 text-[#1DA1F2] " />
                    )}
                  </div>

                  <div className="flex gap-2 items-center text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.address || "-"}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col   mt-1">
                      <span className="text-lg font-semibold text-foreground">
                        {totalPosts}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {totalPosts <= 1 ? "Post" : "Posts"}
                      </span>
                    </div>
                    <div className="flex flex-col  mt-1">
                      {countData?.totalFriends > 0 ? (
                        <Link
                          to={`/friends/${user?._id}`}
                          className="text-lg font-semibold text-foreground"
                        >
                          {countData?.totalFriends}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-foreground">
                          {countData?.totalFriends}
                        </span>
                      )}

                      <span className="text-sm text-muted-foreground">
                        {countData?.totalFriends <= 1
                          ? "Follower"
                          : "Followers"}
                      </span>
                    </div>
                    <div className="flex flex-col  mt-1">
                      {countData?.totalFollowing > 0 ? (
                        <Link
                          to={`/following/${user?._id}`}
                          className="text-lg font-semibold text-foreground"
                        >
                          {countData?.totalFollowing}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-foreground">
                          {countData?.totalFollowing}
                        </span>
                      )}

                      <span className="text-sm text-muted-foreground">
                        Following
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {reqStatus === "pending" ? (
                <Button className="bg-emerald-600 hover:bg-emerald-600 text-white cursor-pointer-none">
                  Requested
                </Button>
              ) : (
                profileId !== id && (
                  <Button
                    onClick={() =>
                      friends ? handleUnfollow() : handleFollow(user?._id)
                    }
                    disabled={isFollowing || isUnfollowing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-transform duration-150 active:scale-95"
                  >
                    {friends ? "Unfollow" : "Follow"}
                  </Button>
                )
              )}

              {/* {reqStatus === "accepted" ? (
                <span
                  onClick={() =>
                    navigate(
                      `/messages?userId=${user?._id}&name=${encodeURIComponent(
                        user?.userName || "User"
                      )}`
                    )
                  }
                  size="sm"
                  className="flex justify-around cursor-pointer"
                >
                  <img
                    src="/src/assets/logo.png"
                    alt="Clix Logo"
                    className="w-8 h-8"
                  />
                </span>
              ) : null} */}
            </div>
          </div>
        </CardContent>
      </Card>
      {friends ? (
        <>
          {displayPosts.map((post) => (
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
                        className="w-full h-full object-cover object-top cursor-pointer"
                        src={user?.profileImage || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {user?.userName?.charAt(0).toUpperCase() || "-"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {user?.userName}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatRelative(post?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <PostContent text={post?.postText} className="mb-4" />

                <PostImageWithLikes
                  post={post}
                  likedUsers={post?.likedByUsers}
                  onImageClick={() => open(post.image)}
                />

                <div className="flex items-center justify-start mt-3">
                  <PostLikeComponent post={post} userId={post?.user?._id} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post?._id)}
                    className="h-9 w-9 p-0 text-muted-foreground hover:bg-transparent cursor-pointer"
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
                    className="h-9 w-9 p-0 text-muted-foreground hover:bg-transparent cursor-pointer"
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

                {openPostId === post._id && (
                  <div className="mt-3">
                    <CommentSection
                      postId={post._id}
                      userProfile={currentUser}
                      highlightCommentId={
                        targetPostId === post._id ? targetCommentId : undefined
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

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
        <Card className="border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-zinc-800 dark:from-black dark:to-zinc-950">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-emerald-100 p-4 dark:bg-zinc-900">
                <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-zinc-100">
                  Follow to See Posts
                </h3>
                <p className="mb-6 max-w-sm text-muted-foreground dark:text-zinc-400">
                  Follow {user?.userName} to view their posts and stay updated
                  with their latest content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersInfo;

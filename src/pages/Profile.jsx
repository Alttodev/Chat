import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useCommentStore,
  useImageModalStore,
  useZustandPopup,
  useZustandSharePopup,
} from "@/lib/zustand";
import { useEffect, useMemo, useRef } from "react";
import {
  useFriendsCount,
  usePostDelete,
  useUserPostList,
} from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { ShareDialog } from "@/components/modals/shareModal";
import PostLikeComponent from "@/components/Post/PostLike";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/Post/CommentSection";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { OnlineStatus } from "@/components/onlineStatus";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { useUserDetail } from "@/hooks/authHooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostDialog } from "@/components/modals/postModal";
import { ImageViewer } from "@/components/modals/imageViewer";
import { PostImageWithLikes } from "@/components/Post/PostImageWithLikes";
import { Link, useSearchParams } from "react-router-dom";
import { usePostInfo } from "@/hooks/postHooks";
import { useScrollToPost } from "@/hooks/useScrollToPost";
import PostContent from "@/components/Post/PostContent";
import { PostSkeleton } from "@/components/skeleton/postListSkeleton";
import { useRequestVerifiedBadge } from "@/hooks/verifybadgeHooks";

const Profile = () => {
  const { openModal } = useZustandPopup();
  const { profileId } = useAuthStore();
  const { openShareModal } = useZustandSharePopup();
  const { openPostId, toggleComments, setOpenPostId } = useCommentStore();
  const loadMoreRef = useRef(null);
  const { open } = useImageModalStore();
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("postId");
  const targetCommentId = searchParams.get("commentId");

  const storedData = JSON.parse(localStorage.getItem("chat-storage") || "{}");
  const userId = storedData?.state?.user?._id;

  const { mutateAsync: deletePost } = usePostDelete();
  const { mutateAsync: requestVerifiedBadge, isPending: verificationLoading } =
    useRequestVerifiedBadge();

  const { data: profileData } = useUserDetail();
  const { data: count } = useFriendsCount();
  const countData = useMemo(() => count, [count]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUserPostList(profileId);

  const userProfile = useMemo(() => profileData, [profileData]);

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

  const handleVerificationRequest = async () => {
    try {
      const res = await requestVerifiedBadge();
      toastSuccess(res?.message || "Verification email sent");
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Failed to send verification email",
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deletePost(id);
      toastSuccess(res?.message);
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
              <div
                onClick={() =>
                  userProfile?.profile?.profileImage &&
                  open(userProfile?.profile?.profileImage)
                }
                className={
                  userProfile?.profile?.profileImage ? "cursor-pointer" : ""
                }
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    className="w-full h-full object-cover object-top"
                    src={
                      userProfile?.profile?.profileImage || "/placeholder.svg"
                    }
                  />
                  <AvatarFallback className="text-2xl font-semibold  text-emerald-700">
                    {userProfile?.profile?.userName?.charAt(0).toUpperCase() ||
                      "-"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute bottom-2 right-2">
                <OnlineStatus userId={userId} size="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-md font-bold text-balance flex items-center gap-1">
                      {userProfile?.profile?.userName}

                      {userProfile?.profile?.isVerified && (
                        <BadgeCheck className="w-5 h-5 fill-blue-500 text-white" />
                      )}
                    </div>

                    {!userProfile?.profile?.isVerified && (
                      <button
                        onClick={handleVerificationRequest}
                        disabled={verificationLoading}
                        className="
        inline-flex
        items-center
        gap-1
        rounded-full
        bg-[#1DA1F2]
        px-3
        py-1
        text-xs
        font-medium
        text-white
        transition
        hover:bg-[#1a8cd8]
        disabled:opacity-50
        cursor-pointer
      "
                      >
                        {verificationLoading ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            verifying...
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="h-3 w-3" />
                            Get Verified
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile?.profile?.address}</span>
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
                    <div className="flex flex-col   mt-1">
                      {countData?.totalFriends > 0 ? (
                        <Link
                          to="/friends"
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
                    <div className="flex flex-col   mt-1">
                      {countData?.totalFriends > 0 ? (
                        <Link
                          to={`/following/${userProfile?.profile?.id}`}
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
          </div>
        </CardContent>
      </Card>

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

              {post?.isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span className="relative cursor-pointer rounded-full border-0 p-1 transition-colors duration-200 hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle user menu</span>
                    </span>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="mt-1 w-full border-border shadow-lg"
                    sideOffset={8}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer transition-colors duration-200"
                      onClick={() =>
                        openModal({ userProfile, postId: post._id })
                      }
                    >
                      <SquarePen className="mr-1 h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-emerald-600" />
                      <span className="font-medium text-emerald-700">
                        Edit Post
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="mt-1 cursor-pointer transition-colors duration-200"
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4 text-muted-foreground transition-colors duration-200" />
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
              likedUsers={post?.likedByUsers}
              post={post}
              onImageClick={() => open(post.image)}
            />

            <PostContent text={post?.postText} className="mt-3 pl-2" />

            <div className="mt-3 flex items-center justify-start">
              <PostLikeComponent post={post} userId={post?.user?._id} />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleComments(post?._id)}
                className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent"
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
                className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent"
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
      <PostDialog />
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

export default Profile;

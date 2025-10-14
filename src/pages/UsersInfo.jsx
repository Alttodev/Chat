import { Mail, MapPin, MessageCircle, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCommentStore, useZustandSharePopup } from "@/lib/zustand";
import { useEffect, useMemo, useRef } from "react";
import {
  useProfileFollow,
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
import { useParams } from "react-router-dom";
import { OnlineStatus } from "@/components/onlineStatus";
import { toastError, toastSuccess } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";

const UsersInfo = () => {
  const { openShareModal } = useZustandSharePopup();
  const { profileId } = useAuthStore();
  const { openPostId, toggleComments } = useCommentStore();
  const loadMoreRef = useRef(null);
  const params = useParams();
  const id = params?.id;

  const { mutateAsync: followRequest, isLoading } = useProfileFollow();

  const { data: count } = useUserInfoCount(id);
  const countData = useMemo(() => count, [count]);

  const { data: requestStatus } = useRequestListInfo({
    fromId: profileId,
    toId: id,
  });

  const reqStatus = requestStatus?.request?.status;
  const isValidStatus = ["pending", "accepted", "declined"].includes(reqStatus);
  let statusMessage = "";

  switch (reqStatus) {
    case "pending":
      statusMessage = "Requested";
      break;
    case "declined":
      statusMessage = "Declined";
      break;
    case "accepted":
      statusMessage = "Following";
      break;
    default:
      statusMessage = "No Request";
      break;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useUserPostList({ id: id });

  const posts = useMemo(
    () => data?.pages?.flatMap((page) => page.posts) || [],
    [data]
  );
  const user = data?.pages?.[0]?.user;
  const currentUser = data?.pages?.[0]?.currentUser;
  const totalPosts = data?.pages?.[0]?.totalPosts;

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
      const res = await followRequest(userId);
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-8">
      {/* Header */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-3">
          <div className="flex justify-between flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl font-semibold  text-emerald-700">
                  {user?.userName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>

              <div className="absolute bottom-2 right-2">
                <OnlineStatus userId={user?._id} size="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-xl font-bold text-balance">
                    {user?.userName || "-"}
                  </div>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email || "-"}</span>
                  </div>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.address || "-"}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col   mt-2">
                      <span className="text-lg font-semibold text-black">
                        {totalPosts}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Posts
                      </span>
                    </div>
                    <div className="flex flex-col   mt-2">
                      <span className="text-lg font-semibold text-black">
                        {countData?.totalFriends}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Followers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {isValidStatus ? (
                <Button className="text-sm bg-emerald-600 hover:bg-emerald-600">
                  {statusMessage}
                </Button>
              ) : (
                <Button
                  onClick={() => handleFollow(user?._id)}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer "
                >
                  Follow
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 text-emerald-600">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} />
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
            <p className="text-foreground mb-4 leading-relaxed text-sm sm:text-base">
              {post?.postText}
            </p>
            {post?.image && (
              <img
                className="w-full h-auto object-cover rounded-lg"
                src={`${import.meta.env.VITE_APP_API_URL}${post.image}`}
                alt="post"
              />
            )}

            <div className="mb-3 pb-3 border-b border-border" />

            <div className="flex items-center justify-between">
              <PostLikeComponent post={post} userId={post?.user?._id} />
              <div className="flex-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post?._id)}
                  className=" text-xs sm:text-sm text-muted-foreground hover:bg-transparent cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-1" /> Comment
                </Button>
              </div>
              <div className="flex-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openShareModal(post?._id)}
                  className="text-xs sm:text-sm text-muted-foreground hover:bg-transparent  cursor-pointer"
                >
                  <Share className="w-4 h-4 mr-1" /> Share
                </Button>
              </div>
            </div>

            {openPostId === post._id && (
              <div className="border-t border-border mt-3">
                <CommentSection postId={post._id} userProfile={currentUser} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <ShareDialog />
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

export default UsersInfo;

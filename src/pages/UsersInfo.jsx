import { BadgeCheck, LoaderCircle, Lock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCommentStore } from "@/lib/zustand";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
  useUserInfoCount,
  useUserPostList,
  usePostInfo,
  useTrendingCreators,
} from "@/hooks/postHooks";
import { ShareDialog } from "@/components/modals/shareModal";
import { Button } from "@/components/ui/button";
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
import { useScrollToPost } from "@/hooks/useScrollToPost";
import { useMarkProfileViewSeen } from "@/hooks/profileViewHooks";
import StatusUserStrip from "@/components/status/StatusUserStrip";
import StatusViewer from "@/components/status/StatusViewer";
import { UserPostGridView } from "@/components/Post/UserPostGridView";
import { useUserPostStore } from "@/lib/zustand";

const UsersInfo = () => {
  const navigate = useNavigate();

  const { profileId } = useAuthStore();
  const { setOpenPostId } = useCommentStore();
  const { mutateAsync: markProfileViewSeen } = useMarkProfileViewSeen();
  const loadMoreRef = useRef(null);
  const params = useParams();
  const id = params?.id;

  const { data: trendingCreatorsData } = useTrendingCreators(id);

  const trendingRank = trendingCreatorsData?.creators?.[0]?.rank || null;

  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("postId");

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

  // Store posts for the grid feed page
  const { setPosts, setUserInfo, setCurrentUser } = useUserPostStore();

  useEffect(() => {
    if (displayPosts.length) setPosts(displayPosts);
  }, [displayPosts, setPosts]);

  useEffect(() => {
    if (user) setUserInfo(user);
  }, [user, setUserInfo]);

  useEffect(() => {
    if (currentUser) setCurrentUser(currentUser);
  }, [currentUser, setCurrentUser]);

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
      await unfollowRequest({ fromId: profileId, toId: id });
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
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-20">
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="pt-5 pb-0 px-4">
          <div className="flex items-center gap-6 sm:gap-10">
            <StatusUserStrip user={user} />

            <div className="flex flex-1 justify-around">
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
                    className="text-lg font-semibold text-foreground leading-none hover:opacity-70 transition-opacity"
                  >
                    {countData?.totalFriends}
                  </Link>
                ) : (
                  <span className="text-lg sm:text-lg font-semibold text-foreground leading-none">
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
                    className="text-lg font-semibold text-foreground leading-none hover:opacity-70 transition-opacity"
                  >
                    {countData?.totalFollowing}
                  </Link>
                ) : (
                  <span className="text-lg sm:text-lg font-semibold text-foreground leading-none">
                    {countData?.totalFollowing ?? 0}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">Following</span>
              </div>
            </div>
          </div>

          {/* Row 2: Username + Location + Bio */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-md font-semibold text-foreground">
                {user?.userName || "-"}
              </span>
              {user?.isVerified && (
                <BadgeCheck className="w-4 h-4 fill-blue-500 text-white shrink-0" />
              )}

              {[1, 2, 3].includes(trendingRank) && (
                <button
                  onClick={() => navigate("/trending")}
                  className="ml-3 inline-flex items-center gap-2 rounded-full px-3 py-1 shadow-sm transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: "#FFF8E6",
                    border: "1px solid #F5B942",
                  }}
                >
                  <span className="text-sm">🔥</span>

                  <span
                    className="text-xs font-semibold tracking-wide"
                    style={{
                      color: "#B7791F",
                    }}
                  >
                    Trending Creator
                  </span>
                </button>
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
          <UserPostGridView posts={displayPosts} userId={id} />

          <ShareDialog />
          <ImageViewer />

          <div ref={loadMoreRef} />

          {isFetchingNextPage && (
            <div className=" flex items-center justify-center">
              <LoaderCircle className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          )}

          {!hasNextPage && displayPosts.length > 0 && (
            <div className="flex justify-center">
              <span className="px-3 text-sm text-muted-foreground">
                No more posts
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full border-2 border-slate-300 dark:border-zinc-700">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-semibold">This Account is Private</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Follow this account to see their photos, videos, and activity.
          </p>
        </div>
      )}

      <StatusViewer />
    </div>
  );
};

export default UsersInfo;

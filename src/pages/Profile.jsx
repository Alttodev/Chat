import { BadgeCheck, Loader2, LoaderCircle, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileEdit, useProfilePostStore } from "@/lib/zustand";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFriendsCount,
  useUserPostList,
  usePostInfo,
  useTrendingCreators,
} from "@/hooks/postHooks";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { useUserDetail } from "@/hooks/authHooks";
import { ImageViewer } from "@/components/modals/imageViewer";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useScrollToPost } from "@/hooks/useScrollToPost";
import { useRequestVerifiedBadge } from "@/hooks/verifybadgeHooks";
import { ProfileEditDialog } from "@/components/modals/profileEditModal";
import StatusMeStrip from "@/components/status/StatusMeStrip";
import { PostGridView } from "@/components/Post/PostGridView";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  const { openProfile, closeProfile } = useProfileEdit();
  const { profileId } = useAuthStore();
  const loadMoreRef = useRef(null);

  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("postId");

  const { data: trendingCreatorsData } = useTrendingCreators();

  const trendingRank = trendingCreatorsData?.creators?.[0]?.rank || null;

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

  const currentUser = data?.pages?.[0]?.currentUser;
  const totalPosts = data?.pages?.[0]?.totalPosts;

  const { setPosts, setUserProfile, setCurrentUser } = useProfilePostStore();

  useEffect(() => {
    if (displayPosts.length) setPosts(displayPosts);
  }, [displayPosts, setPosts]);

  useEffect(() => {
    if (userProfile) setUserProfile(userProfile);
  }, [setUserProfile, userProfile]);

  useEffect(() => {
    if (currentUser) setCurrentUser(currentUser);
  }, [currentUser, setCurrentUser]);

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

  if (isLoading) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-20">
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="pt-5 pb-0 px-4">
          <div className="flex items-center gap-3 sm:gap-10">
            <StatusMeStrip user={userProfile?.profile} />

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
                    to={`/friends/${userProfile?.profile?.id}`}
                    className="text-lg font-semibold text-foreground leading-none hover:opacity-70 transition-opacity"
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
                    to={`/following/${userProfile?.profile?.id}`}
                    className="text-lg font-semibold text-foreground leading-none hover:opacity-70 transition-opacity"
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

          {/* Row 2: Username + Verified badge + Location + Bio */}
          <div className="mt-3 space-y-1">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-md pl-1 font-semibold text-foreground">
                  {userProfile?.profile?.userName}
                </span>
                {userProfile?.profile?.isVerified && (
                  <BadgeCheck className="h-4 w-4 fill-blue-500 text-white shrink-0" />
                )}
              </div>
              {[1, 2, 3].includes(trendingRank) && (
                <button
                  onClick={() => navigate("/trending")}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 shadow-sm transition-all hover:scale-105 cursor-pointer"
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

              {!userProfile?.profile?.isVerified && (
                <button
                  onClick={handleVerificationRequest}
                  disabled={verificationLoading}
                  className="inline-flex items-center gap-1 rounded-full bg-[#1DA1F2] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#1a8cd8] disabled:opacity-50 cursor-pointer"
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Verifying...
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

            {userProfile?.profile?.address && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[240px]">
                  {userProfile?.profile?.address}
                </span>
              </div>
            )}

            {userProfile?.profile?.bio && (
              <p className="text-sm leading-snug text-foreground break-words max-w-sm">
                {userProfile?.profile?.bio}
              </p>
            )}
          </div>

          <div className="mt-3 mb-4">
            <Button
              onClick={() =>
                openProfile({
                  userProfile,
                  isEditing: true,
                  closeEditing: closeProfile,
                })
              }
              variant="outline"
              className="w-28 h-8 rounded-lg text-xs font-semibold shadow-none cursor-pointer"
            >
              Edit profile
            </Button>
          </div>
        </CardContent>

        <ImageViewer />
      </Card>

      <PostGridView posts={displayPosts} />

      <ProfileEditDialog />

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
    </div>
  );
};

export default Profile;

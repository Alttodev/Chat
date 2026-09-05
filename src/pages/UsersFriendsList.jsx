import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { useUserFollowers } from "@/hooks/postHooks";
import { useUserFollowStatuses } from "@/hooks/useUserFollowStatuses";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import UserFriendCard from "@/components/UserFriendCard";

function UsersFriendsList() {
  const { profileId } = useAuthStore();
  const { id } = useParams();
  const loadMoreRef = useRef(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFollowers(id);

  const followers = useMemo(() => {
    return data?.pages?.flatMap((page) => page?.totalFollowers || []) || [];
  }, [data]);

  // Note: this card's user object is nested under `from` (see
  // UserFriendCard), unlike UserCard/RightUserCard where it's the user
  // object itself.
  const followerIds = useMemo(
    () =>
      followers
        .map((user) => String(user?.from?._id ?? ""))
        .filter(Boolean),
    [followers],
  );
  const {
    statuses,
    isLoading: isStatusLoading,
    setStatus,
  } = useUserFollowStatuses(followerIds);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-0 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-md sm:text-lg font-bold">
          {data?.pages?.[0]?.totalCount <= 1 ? "Follower" : "Followers"} (
          {data?.pages?.[0]?.totalCount || 0})
        </h2>
      </div>

      <div className="space-y-4">
        {followers.map((user) => {
          const userId = String(user?.from?._id ?? "");
          return (
            <UserFriendCard
              key={userId}
              user={user}
              profileId={profileId}
              status={statuses[userId]}
              isStatusLoading={isStatusLoading}
              onStatusChange={(patch) => setStatus(userId, patch)}
            />
          );
        })}
      </div>

      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage ? <UsersListSkeleton /> : null}
        {!hasNextPage && followers.length > 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No more followers
          </p>
        ) : null}
        {!isLoading && followers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No followers found
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default UsersFriendsList;
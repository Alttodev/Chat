import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { useUserFollowing } from "@/hooks/postHooks";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import UserFollowingCard from "@/components/UserFollowingCard";

function UsersFollowingList() {
  const { profileId } = useAuthStore();
  const { id } = useParams();
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserFollowing(id);

  const totalFollowing = useMemo(() => {
    return data?.pages?.flatMap((page) => page?.totalFollowing || []) || [];
  }, [data]);


  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting && !isFetchingNextPage) {
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

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-0 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-md sm:text-lg font-bold">
          Following ({data?.pages?.[0]?.totalCount || 0})
        </h2>
      </div>

      <div className="space-y-4">
        {totalFollowing.map((user) => (
          <UserFollowingCard
            key={user?._id}
            user={user}
            profileId={profileId}
          />
        ))}
      </div>

      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage ? <UsersListSkeleton /> : null}
        {!hasNextPage && totalFollowing.length > 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No more following users
          </p>
        ) : null}
        {!isFetching && totalFollowing.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No following users found
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default UsersFollowingList;
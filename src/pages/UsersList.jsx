import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { useUserProfiles } from "@/hooks/authHooks";
import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import UserCard from "@/components/UserCard";
import { useRecommendedConnections } from "@/hooks/postHooks";

function UsersList() {
  const { profileId } = useAuthStore();
  const { data: profile, isFetching } = useUserProfiles();
  const { data: recommendations } = useRecommendedConnections();

  const data = useMemo(() => profile, [profile]);
  const recommendedMap = useMemo(() => {
    const suggestions = recommendations?.suggestions || [];

    return new Map(
      suggestions
        .map((item) => [String(item?.id ?? item?._id ?? ""), item])
        .filter(([id]) => Boolean(id)),
    );
  }, [recommendations]);

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-md sm:text-lg font-bold tracking-tight text-foreground">
          People You May Know
        </h2>
      </div>
      {data?.profiles?.map((user, index) => {
        const userId = String(user?.id ?? user?._id ?? "");
        const recommendedUser = recommendedMap.get(userId);

        return (
          <UserCard
            key={index}
            user={user}
            profileId={profileId}
            recommendedUser={recommendedUser}
          />
        );
      })}
    </div>
  );
}

export default UsersList;

import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import {  useUserFollowing } from "@/hooks/postHooks";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import UserFollowingCard from "@/components/UserFollowingCard";


function UsersFollowingList() {
  const { profileId } = useAuthStore();
  const { id } = useParams();

  const { data: following, isFetching } = useUserFollowing(id);

  const data = useMemo(() => following, [following]);

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6 pb-20">
      {data?.totalFollowing?.map((user, index) => {
        return (
          <UserFollowingCard
            key={index}
            user={user}
            profileId={profileId}
          />
        );
      })}
    </div>
  );
}

export default UsersFollowingList;
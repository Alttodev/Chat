import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { useUserFollowers } from "@/hooks/postHooks";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import UserFriendCard from "@/components/UserFriendCard";

function UsersFriendsList() {
  const { profileId } = useAuthStore();
  const { id } = useParams();

  const { data: followers, isFetching } = useUserFollowers(id);

  const data = useMemo(() => followers, [followers]);

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-md sm:text-lg font-bold">
          Followers({data?.totalFollowers?.length || 0})
        </h2>
      </div>
      {data?.totalFollowers?.map((user, index) => {
        return <UserFriendCard key={index} user={user} profileId={profileId} />;
      })}
    </div>
  );
}

export default UsersFriendsList;

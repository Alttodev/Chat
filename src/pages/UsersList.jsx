import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { useUserProfiles } from "@/hooks/authHooks";
import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import UserCard from "@/components/UserCard";

function UsersList() {
  const { profileId } = useAuthStore();
  const { data: profile, isFetching } = useUserProfiles();

  const data = useMemo(() => profile, [profile]);

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6">
      {data?.profiles?.map((user, index) => {
        return <UserCard key={index} user={user} profileId={profileId} />;
      })}
    </div>
  );
}

export default UsersList;

import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileFollow, useRequestDelete, useRequestList, useUserFollowers } from "@/hooks/postHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { MapPin } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

function UsersFriendsList() {
  const { profileId } = useAuthStore();
  const params = useParams();
  const id = params?.id;
  const { data: followers, isFetching } = useUserFollowers(id);
  const { mutateAsync: followRequest, isPending: isFollowing } = useProfileFollow();
  const { mutateAsync: unfollowRequest, isPending: isUnfollowing } = useRequestDelete();
  const { data: request } = useRequestList();
  const data = useMemo(() => followers, [followers]);

  const requestItems = useMemo(() => {
    const value =
      request?.requests ||
      request?.followRequests ||
      request?.data?.requests ||
      request?.data ||
      [];

    return Array.isArray(value) ? value : [];
  }, [request]);

  const getRelation = (userId) =>
    requestItems.find((item) => {
      const fromId = item?.from?._id?.toString?.();
      const toId = item?.to?._id?.toString?.();
      const currentId = profileId?.toString?.();
      const targetId = userId?.toString?.();

      const directMatch = fromId === currentId && toId === targetId;
      const reverseMatch = fromId === targetId && toId === currentId;
      return directMatch || reverseMatch;
    });

  const handleFollow = async (userId) => {
    try {
      const res = await followRequest(userId);
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const res = await unfollowRequest({
        fromId: profileId,
        toId: userId,
      });
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6">
      {data?.totalFollowers?.map((user, index) => {
        const target = user?.from;
        const userId = target?._id;
        const relation = getRelation(userId);
        const isFriends = relation?.isFriends === true;
        const isPendingRequest =
          String(relation?.status || "").toLowerCase() === "pending" &&
          relation?.from?._id?.toString?.() === profileId?.toString?.();
        const isCurrentUser = profileId?.toString?.() === userId?.toString?.();

        return (
          <Card
            key={index}
            className="border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <Link
                  to={`/users/${target?._id}`}
                  className="flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer flex-1"
                >
                  <div className="relative">
                    <Avatar className="h-18 w-18">
                      <AvatarFallback className="text-xl font-semibold text-emerald-700">
                        {target?.userName?.charAt(0).toUpperCase() || "-"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-2 right-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            target?.isOnline ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        ></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="text-xl font-bold">
                          {target?.userName || "-"}
                        </div>

                        <div className="flex gap-2 items-center text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{target?.address || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {!isCurrentUser && (
                  <Button
                    size="sm"
                    disabled={isFollowing || isUnfollowing || isPendingRequest}
                    onClick={() =>
                      isFriends ? handleUnfollow(userId) : handleFollow(userId)
                    }
                    className={
                      isFriends
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    }
                  >
                    {isPendingRequest ? "Requested" : isFriends ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default UsersFriendsList;

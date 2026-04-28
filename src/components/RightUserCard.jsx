import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
} from "@/hooks/postHooks";

import { toastError } from "@/lib/toast";

function RightUserCard({ user, profileId }) {
 
  const userId = user?.id;

  const { data: requestStatus, refetch } = useRequestListInfo({
    fromId: profileId,
    toId: userId,
  });

  const reqStatus = requestStatus?.request?.status;
  const friends = requestStatus?.request?.isFriends;

  const { mutateAsync: followRequest, isPending: isFollowing } =
    useProfileFollow();

  const { mutateAsync: unfollowRequest, isPending: isUnfollowing } =
    useRequestDelete();

  const handleFollow = async () => {
    try {
      await followRequest(userId);
      // toastSuccess(res?.message);
      // Refetch to update UI immediately
      await refetch();
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowRequest({
        fromId: profileId,
        toId: userId,
      });
      // toastSuccess(res?.message);
      // Refetch to update UI immediately
      await refetch();
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
      {/* Profile */}
      <Link
        to={`/users/${userId}`}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
      >
        <div className="relative">
          <Avatar className="w-10 h-10 text-emerald-600">
            <AvatarImage
               className="w-full h-full object-cover object-top cursor-pointer"
              src={user?.profileImage || "/placeholder.svg"}
            />
            <AvatarFallback>
              {user?.userName?.charAt(0).toUpperCase() || "-"}
            </AvatarFallback>
          </Avatar>

          <div
            className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-background ${
              user?.isOnline ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.userName}</p>
          <p className="text-xs text-muted-foreground">
            {user?.isOnline ? "online" : "offline"}
          </p>
        </div>
      </Link>

      {/* Button */}
      <div className="flex flex-col gap-2">
        {reqStatus === "pending" ? (
          <Button className="bg-emerald-600  hover:bg-emerald-600 text-white cursor-pointer-none  px-3 py-1 text-xs h-7">
            Requested
          </Button>
        ) : (
          profileId !== userId && (
            <Button
              onClick={friends ? handleUnfollow : handleFollow}
              disabled={isFollowing || isUnfollowing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer  px-3 py-1 text-xs h-7 "
            >
              {friends ? "Unfollow" : "Follow"}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default RightUserCard;

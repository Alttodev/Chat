import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
} from "@/hooks/postHooks";

import { toastError, toastSuccess } from "@/lib/toast";

function UserCard({ user, profileId }) {
  const userId = user?.id;
  const canOpenProfile = profileId !== userId;
  const { data: requestStatus } = useRequestListInfo({
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
      const res = await followRequest(userId);
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleUnfollow = async () => {
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

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {canOpenProfile ? (
            <Link
              to={`/users/${userId}`}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer flex-1"
            >
              <div className="relative">
                <Avatar className="h-18 w-18">
                  <AvatarImage
                    className="w-full h-full object-cover object-top"
                    src={user?.profileImage || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-2xl font-semibold text-emerald-700">
                    {user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                {/* Online Status */}
                <div className="absolute bottom-2 right-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    ></span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-md flex items-center gap-1 font-bold text-foreground">
                    {user?.userName || "-"}
                    {user?.isVerified && (
                      <BadgeCheck className="w-5 h-5 fill-blue-500 text-white" />
                    )}
                  </div>

                  <div className="flex gap-2 items-center text-md text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.address || "-"}</span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
              <div className="relative">
                <Avatar className="h-18 w-18">
                  <AvatarImage
                    className="w-full h-full object-cover object-top"
                    src={user?.profileImage || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-2xl font-semibold text-emerald-700">
                    {user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                {/* Online Status */}
                <div className="absolute bottom-2 right-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    ></span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {user?.userName || "-"}
                  </div>

                  <div className="flex gap-2 items-center text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.address || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {reqStatus === "pending" ? (
              <Button
                className="
    bg-rose-500/10
    hover:bg-rose-500/15
    text-rose-600
    border
    border-rose-500/20
    rounded-full
    px-4
    h-8
    text-xs
    font-medium
    flex
    items-center
    gap-1.5
    cursor-default
    shadow-sm
  "
              >
                Pending
              </Button>
            ) : (
              profileId !== userId && (
                <Button
                  onClick={friends ? handleUnfollow : handleFollow}
                  disabled={isFollowing || isUnfollowing}
                  className={`
    rounded-full
    px-4
    h-8
    text-xs
    font-medium
    cursor-pointer
    transition-all
    duration-200
    active:scale-95
    shadow-sm
    ${
      friends
        ? `
          bg-zinc-100
          hover:bg-zinc-200
          text-zinc-700
          border
          border-zinc-200
        `
        : `
          bg-emerald-600
          hover:bg-emerald-700
          text-white
        `
    }
  `}
                >
                  {friends ? "Unfollow" : "Follow"}
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserCard;

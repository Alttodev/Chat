import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
} from "@/hooks/postHooks";

import { toastError } from "@/lib/toast";
import { BadgeCheck, MapPin } from "lucide-react";

function RightUserCard({ user, profileId, compact = false }) {
  const userId = user?.id ?? user?._id;

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
    <div
      className={`rounded-2xl border border-border/60 bg-card/80 transition-colors hover:bg-muted/40 ${
        compact
          ? "w-[78vw] min-w-[210px] max-w-[260px] snap-start shrink-0 p-4"
          : "flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
      }`}
    >
      {compact ? (
        <div className="flex flex-col items-center text-center">
          <Link
            to={`/users/${userId}`}
            className="flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 text-emerald-600">
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

            <div className="min-w-0 ">
              <div className="flex items-center justify-center gap-1  truncate text-sm font-semibold text-foreground">
                  {user?.userName}
                {user?.isVerified && (
                  <BadgeCheck className="h-4 w-4 fill-blue-500 text-white flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-2 items-center mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{user?.address}</span>
              </div>
            </div>
          </Link>

          <div className="mt-4 flex w-full">
            {reqStatus === "pending" ? (
              <Button className="h-8 w-full cursor-default rounded-full border border-rose-500/20 bg-rose-500/10 px-4 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-500/15">
                Pending
              </Button>
            ) : profileId !== userId && friends ? (
              <Button
                onClick={handleUnfollow}
                disabled={isFollowing || isUnfollowing}
                className="h-8 w-full rounded-full border border-zinc-200 bg-zinc-100 px-4 text-xs font-medium text-zinc-700 shadow-sm transition-all duration-200 active:scale-95 hover:bg-zinc-200"
              >
                {friends ? "Unfollow" : "Follow"}
              </Button>
            ) : profileId !== userId ? (
              <Button
                onClick={handleFollow}
                disabled={isFollowing || isUnfollowing}
                className="h-8 w-full rounded-full bg-emerald-600 px-4 text-xs font-medium text-white shadow-sm transition-all duration-200 active:scale-95 hover:bg-emerald-700"
              >
                {friends ? "Unfollow" : "Follow"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <Link
            to={`/users/${userId}`}
            className="flex min-w-0 flex-1 items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-11 w-11 text-emerald-600">
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
              <div className="text-sm flex items-center gap-1  font-medium truncate">
                {" "}
                {user?.userName}
                {user?.isVerified && (
                  <BadgeCheck className="h-4 w-4 fill-blue-500 text-white flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-1 items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{user?.address}</span>
              </div>
            </div>
          </Link>

          <div className="flex w-full sm:w-auto">
            {reqStatus === "pending" ? (
              <Button className="h-8 w-full cursor-default rounded-full border border-rose-500/20 bg-rose-500/10 px-4 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-500/15 sm:w-auto">
                Pending
              </Button>
            ) : (
              profileId !== userId && (
                <Button
                  onClick={friends ? handleUnfollow : handleFollow}
                  disabled={isFollowing || isUnfollowing}
                  className={`h-8 w-full rounded-full px-4 text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95 shadow-sm sm:w-auto ${
                    friends
                      ? "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {friends ? "Unfollow" : "Follow"}
                </Button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RightUserCard;

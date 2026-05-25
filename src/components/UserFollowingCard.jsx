import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
} from "@/hooks/postHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { BadgeCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function UserFollowingCard({ user, profileId }) {
  const target = user?.to;
  const userId = target?._id;

  const { mutateAsync: followRequest, isPending: isFollowing } =
    useProfileFollow();

  const { mutateAsync: unfollowRequest, isPending: isUnfollowing } =
    useRequestDelete();

  const { data: requestStatus, isFetching } = useRequestListInfo({
    fromId: profileId,
    toId: userId,
  });

  const reqStatus = requestStatus?.request?.status;
  const friends = requestStatus?.request?.isFriends;
  const canOpenProfile = profileId !== userId;

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
    <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
          {canOpenProfile ? (
            <Link
              to={`/users/${target?._id}`}
              className="flex min-w-0 flex-1 flex-row items-center gap-3 sm:gap-4 cursor-pointer"
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={target?.profileImage || "/placeholder.svg"}
                  />

                  <AvatarFallback className="text-base sm:text-xl font-semibold text-emerald-700">
                    {target?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute bottom-1 right-1">
                  <span
                    className={`block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                      target?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1 ">
                <div className="flex min-w-0 items-center gap-1 text-sm sm:text-md font-bold text-foreground">
                  <span className="truncate">{target?.userName || "-"}</span>

                  {target?.isVerified && (
                    <BadgeCheck className="h-4 w-4 fill-blue-500 text-white shrink-0" />
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />

                  <span className="truncate">{target?.address || "-"}</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 flex-row items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={target?.profileImage || "/placeholder.svg"}
                  />

                  <AvatarFallback className="text-base sm:text-xl font-semibold text-emerald-700">
                    {target?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute bottom-1 right-1">
                  <span
                    className={`block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                      target?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1 text-sm sm:text-md font-bold text-foreground">
                  <span className="truncate">{target?.userName || "-"}</span>

                  {target?.isVerified && (
                    <BadgeCheck className="h-4 w-4 fill-blue-500 text-white shrink-0" />
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />

                  <span className="truncate">{target?.address || "-"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="shrink-0">
            {reqStatus === "pending" ? (
              <Button
                disabled={isFetching}
                className="
                  h-7 sm:h-8
                  rounded-full
                  px-3 sm:px-4
                  text-[11px] sm:text-xs
                  font-medium
                  cursor-default
                  shadow-sm
                  border border-rose-500/20
                  bg-rose-500/10
                  text-rose-600
                  hover:bg-rose-500/15
                "
              >
                Pending
              </Button>
            ) : (
              profileId !== userId && (
                <Button
                  onClick={friends ? handleUnfollow : handleFollow}
                  disabled={isFetching || isFollowing || isUnfollowing}
                  className={`
                    h-7 sm:h-8
                    rounded-full
                    px-3 sm:px-4
                    text-[11px] sm:text-xs
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
                  {isFetching
                    ? "Loading..."
                    : isFollowing || isUnfollowing
                      ? "Please wait..."
                      : friends
                        ? "Unfollow"
                        : "Follow"}
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserFollowingCard;

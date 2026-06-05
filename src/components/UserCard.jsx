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

const getRecommendedByLabel = (user) => {
  const friendNames = [
    ...(Array.isArray(user?.suggestedByFriendNames)
      ? user.suggestedByFriendNames
      : []),
    ...(Array.isArray(user?.suggestedByFriends)
      ? user.suggestedByFriends
          .map((friend) => friend?.userName)
          .filter(Boolean)
      : []),
  ].filter(Boolean);

  const uniqueFriendNames = [...new Set(friendNames)];
  const mutualFriendCount = Number(
    user?.mutualFriendCount || uniqueFriendNames.length,
  );

  if (!mutualFriendCount) return null;

  if (uniqueFriendNames.length > 0) {
    const [firstName, ...rest] = uniqueFriendNames;
    if (rest.length > 0) {
      return `Followed by ${firstName}`;
    }

    return `Followed by ${firstName}`;
  }

  return `Followed by ${mutualFriendCount} mutual friend${
    mutualFriendCount === 1 ? "" : "s"
  }`;
};

function UserCard({ user, profileId, recommendedUser }) {
  const userId = user?.id;
  const canOpenProfile = profileId !== userId;

  const { data: requestStatus, isFetching } = useRequestListInfo({
    fromId: profileId,
    toId: userId,
  });

  const reqStatus = requestStatus?.request?.status;
  const friends = requestStatus?.request?.isFriends;
  const recommendedByLabel = getRecommendedByLabel(recommendedUser);

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
    <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
          {canOpenProfile ? (
            <Link
              to={`/users/${userId}`}
              className="flex min-w-0 flex-1 flex-row items-center gap-3 sm:gap-4 cursor-pointer"
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={user?.profileImage || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-base sm:text-2xl font-semibold text-emerald-700">
                    {user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute bottom-1 right-1">
                  <span
                    className={`block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                      user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1 text-sm sm:text-md font-bold text-foreground">
                    <span className="truncate">{user?.userName || "-"}</span>
                    {user?.isVerified && (
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 fill-blue-500 text-white shrink-0" />
                    )}
                  </div>

                  <div className="flex min-w-0 items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{user?.address || "-"}</span>
                  </div>

                  {recommendedByLabel ? (
                    <div
                      className="
                        mt-1
                        max-w-[140px] sm:max-w-[180px]
                        break-words
                        text-[11px] sm:text-sm
                        leading-4
                        text-muted-foreground
                      "
                    >
                      {recommendedByLabel}
                    </div>
                  ) : null}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 flex-row items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={user?.profileImage || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-base sm:text-2xl font-semibold text-emerald-700">
                    {user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute bottom-1 right-1">
                  <span
                    className={`block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                      user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
                <div className="min-w-0">
                  <div className="truncate text-sm sm:text-xl font-bold text-foreground">
                    {user?.userName || "-"}
                  </div>

                  <div className="flex min-w-0 items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{user?.address || "-"}</span>
                  </div>

                  {recommendedByLabel ? (
                    <div
                      className="
                        mt-1
                        max-w-[140px] sm:max-w-[180px]
                        break-words
                        text-[11px] sm:text-sm
                        leading-4
                        text-muted-foreground
                      "
                    >
                      {recommendedByLabel}
                    </div>
                  ) : null}
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
                  loading={isFetching}
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

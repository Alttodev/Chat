import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useProfileFollow,
  useRequestDelete,
  useRequestListInfo,
} from "@/hooks/postHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function UserFriendCard({ user, profileId }) {
  const target = user?.from;
  const userId = target?._id;

  const { mutateAsync: followRequest, isPending: isFollowing } =
    useProfileFollow();

  const { mutateAsync: unfollowRequest, isPending: isUnfollowing } =
    useRequestDelete();

  const { data: requestStatus } = useRequestListInfo({
    fromId: profileId,
    toId: userId,
  });

  const reqStatus = requestStatus?.request?.status;
  const friends = requestStatus?.request?.isFriends;

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
          <Link
            to={`/users/${target?._id}`}
            className="flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer flex-1"
          >
            <div className="relative">
              <Avatar className="h-18 w-18">
                <AvatarImage
                  className="w-full h-full object-cover object-top"
                  src={target?.profileImage || "/placeholder.svg"}
                />
                <AvatarFallback className="text-xl font-semibold text-emerald-700">
                  {target?.userName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>

              <div className="absolute bottom-2 right-0">
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
              <div className="text-xl font-bold">{target?.userName || "-"}</div>

              <div className="flex gap-2 items-center text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{target?.address || "-"}</span>
              </div>
            </div>
          </Link>

          {reqStatus === "pending" ? (
            <Button className="bg-emerald-600 hover:bg-emerald-600 text-white cursor-pointer-none">
              Requested
            </Button>
          ) : (
            profileId !== userId && (
              <Button
                onClick={friends ? handleUnfollow : handleFollow}
                disabled={isFollowing || isUnfollowing}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer "
              >
                {friends ? "Unfollow" : "Follow"}
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default UserFriendCard;

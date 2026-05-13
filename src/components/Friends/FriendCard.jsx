import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFriendsList } from "@/hooks/postHooks";
import { useMemo } from "react";
import { SkeletonRequest } from "../skeleton/RequestSkeleton";
import { Link } from "react-router-dom";
import { MapPin, UsersRound } from "lucide-react";

export const FriendCard = ({ tabValue }) => {
  const { data: friendsList, isFetching } = useFriendsList();
  const friendData = useMemo(() => friendsList, [friendsList]);

  const friends = friendData?.friends?.filter(
    (item) => item?.isFriends === true,
  );
  const onlineFriends = friendData?.friends?.filter(
    (item) => item?.from?.isOnline === true && item?.isFriends === true,
  );
  const friendsData = tabValue === "online" ? onlineFriends : friends;

  if (!friendsData || friendsData.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No data found
      </div>
    );
  }

  if (isFetching) {
    return <SkeletonRequest />;
  }
  return (
    <>
      {friendsData?.map((item) => {
        const friendId = item?.from?._id || item?.to?._id || item?._id;

        return (
          <Link key={friendId} to={`/users/${item?.from?._id}`}>
            <Card className="bg-card shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-row items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        className="h-full w-full cursor-pointer object-cover object-top"
                        src={item?.from?.profileImage || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-xl font-semibold text-emerald-700">
                        {item?.from?.userName?.charAt(0).toUpperCase() || "-"}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background ${
                        item?.from?.isOnline ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item?.from?.userName}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{item?.from?.address || "-"}</span>
                    </div>
                  </div>
                </div>
                <UsersRound className="size-7 rounded p-1 text-green-500" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </>
  );
};

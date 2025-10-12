import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFriendsList } from "@/hooks/postHooks";
import { MessageCircle } from "lucide-react";
import { Fragment, useMemo } from "react";
import { SkeletonRequest } from "../skeleton/RequestSkeleton";

export const FriendCard = ({ tabValue }) => {
  const { data: friendsList, isFetching } = useFriendsList();
  const friendData = useMemo(() => friendsList, [friendsList]);

  const friends = friendData?.friends?.filter((item) => item?.isFriends === true);
  const onlineFriends = friendData?.friends?.filter(
    (item) => item?.from?.isOnline === true && item?.isFriends === true
  );
  const friendsData = tabValue === "online" ? onlineFriends : friends;

  if (!friendsData || friendsData.length === 0) {
    return <div className="text-center py-10 text-gray-500">No data found</div>;
  }

  if (isFetching) {
    return <SkeletonRequest />;
  }
  return (
    <Fragment>
      {friendsData &&
        friendsData?.map((item) => (
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-xl font-semibold  text-emerald-700">
                      {item?.from?.userName?.charAt(0).toUpperCase() || "-"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-background ${
                      item?.from?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></div>
                </div>
                <div>
                  <h3 className="font-semibold">{item?.from?.userName}</h3>
                  <p className="text-sm text-gray-500">{item?.from?.address}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <MessageCircle className="h-3 w-3 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </Fragment>
  );
};

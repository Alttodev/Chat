import { OnlineStatus } from "@/components/onlineStatus";
import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useUserFollowers } from "@/hooks/postHooks";
import { MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

function UsersFriendsList() {
  const params = useParams();
  const id = params?.id;
  const { data: followers, isFetching } = useUserFollowers(id);
  const data = useMemo(() => followers, [followers]);

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6">
      {data?.totalFollowers?.map((user, index) => (
        <Card
          key={index}
          className="border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <Link
              to={`/users/${user?.from?._id}`}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer"
            >
              <div className="relative">
                <Avatar className="h-18 w-18">
                  <AvatarFallback className="text-xl font-semibold text-emerald-700">
                    {user?.from?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2">
                  <OnlineStatus userId={user?.from?._id} size="h-3 w-3" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold">
                      {user?.from?.userName || "-"}
                    </div>

                    <div className="flex gap-2 items-center text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{user?.from?.address || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UsersFriendsList;

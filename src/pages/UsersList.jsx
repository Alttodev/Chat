import { OnlineStatus } from "@/components/onlineStatus";
import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useUserProfiles } from "@/hooks/authHooks";
import { MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

function UsersList() {
  const { data: profile, isFetching } = useUserProfiles();
  const data = useMemo(() => profile, [profile]);

  if (isFetching) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6">
      {data?.profiles?.map((user, index) => (
        <Card
          key={index}
          className="border-border shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <Link
              to={`/users/${user?.id}`}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer"
            >
              <div className="relative">
                <Avatar className="h-18 w-18">
                  <AvatarFallback className="text-2xl font-semibold text-emerald-700">
                    {user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    ></span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold">
                      {user?.userName || "-"}
                    </div>

                    <div className="flex gap-2 items-center text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{user?.address || "-"}</span>
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

export default UsersList;

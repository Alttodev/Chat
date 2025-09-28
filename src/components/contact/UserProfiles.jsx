import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export function UserProfiles({ data }) {
  return (
    <>
      {/* Friend Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">People You May Know</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data?.profiles?.map((contact, index) => (
            <Link
              to={`/users/${contact?.id}`}
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="relative">
                <Avatar className="w-10 h-10 text-emerald-600">
                  <AvatarFallback>
                    {contact?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-background ${
                    contact?.isOnline ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{contact?.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {contact?.isOnline ? "online" : "offline"}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MapPin } from "lucide-react";

export function SearchResults({ data, isLoading, query }) {
  const profiles = data?.profiles || [];

  if (!query) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg p-4 z-50">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Searching...</span>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg p-4 z-50">
        <div className="text-center text-sm text-muted-foreground">
          No users found matching "{query}"
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
      <div className="p-2">
        {profiles.slice(0, 8).map((user) => (
          <Link
            key={user.id}
            to={`/users/${user.id}`}
            className="block hover:bg-accent rounded-md transition-colors"
          >
            <Card className="bg-transparent border-0 shadow-none hover:bg-accent/50">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      src={user?.profileImage || "/placeholder.svg"}
                    />
                    <AvatarFallback className="text-sm font-semibold text-emerald-700">
                      {user?.userName?.charAt(0).toUpperCase() || "-"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-background ${
                      user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {user?.userName}
                  </h4>
                  <div className="flex gap-1 items-center text-muted-foreground text-xs">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{user?.address || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {profiles.length > 8 && (
          <div className="text-center text-xs text-muted-foreground p-2">
            +{profiles.length - 8} more results
          </div>
        )}
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SearchResults({ data, isLoading, query }) {
  const profiles = data?.profiles || [];

  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!query || !isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-background p-4 shadow-lg"
      >
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Searching...
          </span>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div
        ref={containerRef}
        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-background p-4 shadow-lg"
      >
        <div className="text-center text-sm text-muted-foreground">
          No users found matching "{query}"
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-border bg-background shadow-lg"
    >
      <div className="p-2">
        {profiles.slice(0, 8).map((user) => (
          <Link
            key={user.id}
            to={`/users/${user.id}`}
            className="block rounded-md transition-colors hover:bg-accent"
          >
            <Card className="border-0 bg-transparent shadow-none hover:bg-accent/50">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      className="h-full w-full object-cover object-top"
                      src={user?.profileImage || "/placeholder.svg"}
                    />

                    <AvatarFallback className="text-sm font-semibold text-emerald-700">
                      {user?.userName?.charAt(0).toUpperCase() || "-"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background ${
                      user?.isOnline
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium">
                    {user?.userName}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />

                    <span className="truncate">
                      {user?.address || "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {profiles.length > 8 && (
          <div className="p-2 text-center text-xs text-muted-foreground">
            +{profiles.length - 8} more results
          </div>
        )}
      </div>
    </div>
  );
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SearchResults({ data, isLoading, query, onClose }) {
  const profiles = data?.profiles || [];
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Searching...</span>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Search users...
      </div>
    );
  }

  if (profiles.length === 0) {
    return <CommandEmpty>No users found matching "{query}"</CommandEmpty>;
  }

  return (
    <CommandGroup>
      {profiles.map((user) => (
        <CommandItem
          key={user.id}
          value={`${user.userName} ${user.address || ""}`}
          onSelect={() => {
            navigate(`/users/${user.id}`);
            onClose?.();
          }}
          className="cursor-pointer"
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.profileImage || "/placeholder.svg"}
                className="object-cover object-top"
              />
              <AvatarFallback>
                {user?.userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-background ${
                user?.isOnline ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
          </div>

          <div className="flex flex-col ml-2 flex-1 overflow-hidden">
            <span className="truncate font-medium">{user.userName}</span>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="!h-3 !w-3" />

              <span className="truncate">{user.address || "-"}</span>
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

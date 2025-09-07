import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export const FriendCard = ({ friend, onlineOnly }) => (
  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12 text-emerald-600">
            <AvatarImage src={friend.avatar} alt={friend.name} />
            <AvatarFallback>
              {friend.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
              friend.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold">{friend.name}</h3>
          <p className="text-sm text-gray-500">{friend.username}</p>
          {!onlineOnly && !friend.isOnline && friend.lastSeen && (
            <span className="text-xs text-gray-400">
              Last seen {friend.lastSeen}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
      >
        <MessageCircle className="h-3 w-3 mr-2" />
        Chat
      </Button>
    </CardContent>
  </Card>
);

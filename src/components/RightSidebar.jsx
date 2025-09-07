import { MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RightSidebar() {
  const suggestedFriends = [
    {
      name: "Sarah Wilson",
      mutualFriends: 12,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Mike Johnson",
      mutualFriends: 8,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Emma Davis",
      mutualFriends: 15,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const onlineContacts = [
    {
      name: "Alex Chen",
      status: "online",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      name: "Lisa Park",
      status: "online",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      name: "Tom Brown",
      status: "away",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      name: "Kate Miller",
      status: "online",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ];

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-sidebar border-l border-sidebar-border overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Friend Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">People You May Know</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedFriends.map((friend) => (
              <div
                key={friend.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 text-emerald-600">
                    <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {friend.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {friend.mutualFriends} mutual friends
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 cursor-pointer">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Online Contacts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contacts</CardTitle>
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {onlineContacts.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="w-8 h-8 text-emerald-600">
                    <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      contact.status === "online"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium">{contact.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
